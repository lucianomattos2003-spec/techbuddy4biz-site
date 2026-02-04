/**
 * Media Library Routes
 *
 * GET    /api/media           - List client's media assets
 * GET    /api/media/:id       - Get single asset details
 * POST   /api/media           - Save media record after upload
 * PUT    /api/media/:id       - Update asset (tags, notes, platforms)
 * DELETE /api/media/:id       - Delete asset
 * POST   /api/media/sign      - Get signed Cloudinary upload params
 */

import { getAdminClient } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';
import { json, created, noContent, error, parseBody } from '../../lib/response.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate GCD for aspect ratio
 */
function gcd(a, b) {
  return b ? gcd(b, a % b) : a;
}

/**
 * Calculate aspect ratio string from dimensions
 * @param {number} width
 * @param {number} height
 * @returns {string} e.g., "1:1", "4:5", "16:9"
 */
function calculateAspectRatio(width, height) {
  if (!width || !height) return null;
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Generate thumbnail URL from Cloudinary URL
 * @param {string} url - Original Cloudinary URL
 * @returns {string} - Thumbnail URL
 */
function generateThumbnailUrl(url) {
  if (!url) return null;
  // Insert thumbnail transformation after /upload/
  return url.replace('/upload/', '/upload/c_thumb,w_300,h_300,g_auto/');
}

/**
 * Determine suitable platforms based on image dimensions and aspect ratio
 * @param {number} width
 * @param {number} height
 * @param {string} aspectRatio
 * @returns {string[]} - Array of platform IDs
 */
function getSuitablePlatforms(width, height, aspectRatio) {
  const platforms = [];

  if (!width || !height) return platforms;

  const ratio = width / height;

  // Instagram: 1:1, 4:5, 9:16 work best
  // 1:1 = 1.0, 4:5 = 0.8, 9:16 = 0.5625
  if (['1:1', '4:5', '9:16'].includes(aspectRatio) ||
      (width >= 1080 && height >= 1080) ||
      (ratio >= 0.5 && ratio <= 1.92)) {
    platforms.push('instagram');
  }

  // Facebook: flexible, but 1:1, 4:5, 16:9 work best
  if (width >= 1080) {
    platforms.push('facebook');
  }

  // LinkedIn: 1:1, 1.91:1, 4:5 work best
  if (['1:1', '4:5'].includes(aspectRatio) ||
      (ratio >= 1.9 && ratio <= 2) ||
      width >= 1080) {
    platforms.push('linkedin');
  }

  // TikTok: 9:16 (vertical) preferred
  if (aspectRatio === '9:16' || height > width) {
    platforms.push('tiktok');
  }

  // Twitter/X: flexible
  if (width >= 600) {
    platforms.push('twitter');
  }

  return platforms;
}

/**
 * Map database asset to frontend-expected format
 */
function mapAssetToFrontend(asset) {
  return {
    asset_id: asset.asset_id,
    cloudinary_url: asset.storage_url,
    cloudinary_public_id: asset.storage_public_id,
    thumbnail_url: asset.thumbnail_url,
    filename: asset.original_filename,
    mime_type: asset.mime_type,
    size_bytes: asset.file_size_bytes,
    width: asset.width,
    height: asset.height,
    aspect_ratio: asset.aspect_ratio,
    suitable_platforms: asset.suitable_platforms,
    tags: asset.tags,
    notes: asset.notes,
    asset_type: asset.asset_type,
    status: asset.status,
    used_count: asset.used_count || 0,
    last_used_at: asset.last_used_at,
    uploaded_by: asset.uploaded_by,
    created_at: asset.created_at
  };
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

/**
 * List media assets for the authenticated client
 * Query params:
 *   - tags: comma-separated tags to filter by
 *   - type: 'image' | 'video' | 'all' (default: all)
 *   - platform: filter by suitable platform
 *   - search: search in filename
 *   - limit: max results (default 50)
 *   - offset: pagination offset
 */
export async function listMedia(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const url = new URL(request.url);
  const params = url.searchParams;

  // If no client_id (admin user without client context), return error
  if (!client_id) {
    const queryClientId = params.get('client_id');
    if (!queryClientId) {
      return error('client_id is required (no client context)', 400);
    }
  }

  const targetClientId = client_id || params.get('client_id');
  const db = getAdminClient();

  // Build query with all relevant columns
  let query = db
    .from('social_assets')
    .select('asset_id, storage_url, storage_public_id, thumbnail_url, original_filename, mime_type, file_size_bytes, width, height, aspect_ratio, suitable_platforms, tags, notes, asset_type, status, used_count, last_used_at, uploaded_by, created_at', { count: 'exact' })
    .eq('client_id', targetClientId)
    .order('created_at', { ascending: false });

  // Filter by tags if provided
  if (params.get('tags')) {
    const tags = params.get('tags').split(',').map(t => t.trim());
    query = query.overlaps('tags', tags);
  }

  // Filter by type
  const type = params.get('type');
  if (type === 'image') {
    query = query.like('mime_type', 'image/%');
  } else if (type === 'video') {
    query = query.like('mime_type', 'video/%');
  }

  // Filter by platform suitability
  const platform = params.get('platform');
  if (platform) {
    query = query.contains('suitable_platforms', [platform]);
  }

  // Search in filename
  const search = params.get('search');
  if (search) {
    query = query.ilike('original_filename', `%${search}%`);
  }

  const limit = Math.min(parseInt(params.get('limit') || '50'), 100);
  const offset = parseInt(params.get('offset') || '0');
  query = query.range(offset, offset + limit - 1);

  const { data: assets, count: total, error: dbError } = await query;

  if (dbError) {
    console.error('List media error:', dbError);
    return error(`Failed to fetch media: ${dbError.message || 'Database error'}`, 500);
  }

  const mappedAssets = (assets || []).map(mapAssetToFrontend);

  return json({
    assets: mappedAssets,
    total: total || 0,
    count: mappedAssets.length,
    limit,
    offset
  });
}

/**
 * Get single asset by ID
 * GET /api/media/:assetId
 */
export async function getMedia(request, assetId) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const db = getAdminClient();

  let query = db
    .from('social_assets')
    .select('*')
    .eq('asset_id', assetId);

  // Non-admin users can only access their own assets
  if (!isAdmin) {
    query = query.eq('client_id', client_id);
  }

  const { data: asset, error: dbError } = await query.single();

  if (dbError) {
    if (dbError.code === 'PGRST116') {
      return error('Asset not found', 404);
    }
    console.error('Get media error:', dbError);
    return error(`Failed to fetch asset: ${dbError.message}`, 500);
  }

  return json({ asset: mapAssetToFrontend(asset) });
}

/**
 * Save media record after successful Cloudinary upload
 * POST /api/media
 *
 * Body: {
 *   cloudinary_url: string (required),
 *   cloudinary_public_id: string (optional),
 *   filename: string (optional),
 *   mime_type: string (optional),
 *   size_bytes: number (optional),
 *   width: number (optional - from Cloudinary response),
 *   height: number (optional - from Cloudinary response),
 *   tags: string[] (optional),
 *   notes: string (optional),
 *   suitable_platforms: string[] (optional - auto-calculated if not provided)
 * }
 */
export async function saveMediaRecord(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, user } = authResult;
  const body = await parseBody(request);

  if (!body?.cloudinary_url) return error('cloudinary_url is required');

  // Determine target client_id
  const targetClientId = client_id || body.client_id;
  if (!targetClientId) {
    return error('client_id is required (no client context)', 400);
  }

  // Calculate aspect ratio if dimensions provided
  const width = body.width || null;
  const height = body.height || null;
  const aspectRatio = calculateAspectRatio(width, height);

  // Generate thumbnail URL
  const thumbnailUrl = generateThumbnailUrl(body.cloudinary_url);

  // Calculate suitable platforms if not provided
  const suitablePlatforms = body.suitable_platforms ||
    getSuitablePlatforms(width, height, aspectRatio);

  const db = getAdminClient();

  const assetData = {
    client_id: targetClientId,
    storage_provider: 'cloudinary',
    storage_url: body.cloudinary_url,
    storage_public_id: body.cloudinary_public_id || null,
    thumbnail_url: thumbnailUrl,
    original_filename: body.filename || null,
    mime_type: body.mime_type || null,
    file_size_bytes: body.size_bytes || null,
    width,
    height,
    aspect_ratio: aspectRatio,
    suitable_platforms: suitablePlatforms,
    asset_type: body.mime_type?.startsWith('video') ? 'video' : 'image',
    tags: body.tags || [],
    notes: body.notes || null,
    uploaded_by: user?.email || null,
    status: 'approved', // Auto-approve uploads from portal
    approved_at: new Date().toISOString()
  };

  const { data: asset, error: dbError } = await db
    .from('social_assets')
    .insert(assetData)
    .select()
    .single();

  if (dbError) {
    console.error('Save media error:', dbError);
    return error(`Failed to save media record: ${dbError.message || 'Database error'}`, 500);
  }

  return created({ asset: mapAssetToFrontend(asset), message: 'Media saved to library' });
}

/**
 * Update media asset
 * PUT /api/media/:assetId
 *
 * Body: {
 *   tags: string[] (optional),
 *   notes: string (optional),
 *   suitable_platforms: string[] (optional)
 * }
 */
export async function updateMedia(request, assetId) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const body = await parseBody(request);
  const db = getAdminClient();

  // Verify asset exists and belongs to client
  let checkQuery = db
    .from('social_assets')
    .select('asset_id')
    .eq('asset_id', assetId);

  if (!isAdmin) {
    checkQuery = checkQuery.eq('client_id', client_id);
  }

  const { data: existing, error: checkError } = await checkQuery.single();

  if (checkError || !existing) {
    return error('Asset not found', 404);
  }

  // Build update object with allowed fields only
  const updateData = {
    updated_at: new Date().toISOString()
  };

  if (body.tags !== undefined) {
    if (!Array.isArray(body.tags)) {
      return error('tags must be an array');
    }
    if (body.tags.length > 10) {
      return error('Maximum 10 tags allowed');
    }
    updateData.tags = body.tags;
  }

  if (body.notes !== undefined) {
    if (typeof body.notes !== 'string') {
      return error('notes must be a string');
    }
    if (body.notes.length > 500) {
      return error('notes cannot exceed 500 characters');
    }
    updateData.notes = body.notes;
  }

  if (body.suitable_platforms !== undefined) {
    if (!Array.isArray(body.suitable_platforms)) {
      return error('suitable_platforms must be an array');
    }
    const validPlatforms = ['instagram', 'facebook', 'linkedin', 'twitter', 'tiktok'];
    for (const p of body.suitable_platforms) {
      if (!validPlatforms.includes(p)) {
        return error(`Invalid platform: ${p}`);
      }
    }
    updateData.suitable_platforms = body.suitable_platforms;
  }

  const { data: asset, error: dbError } = await db
    .from('social_assets')
    .update(updateData)
    .eq('asset_id', assetId)
    .select()
    .single();

  if (dbError) {
    console.error('Update media error:', dbError);
    return error(`Failed to update asset: ${dbError.message}`, 500);
  }

  return json({ asset: mapAssetToFrontend(asset), message: 'Asset updated' });
}

/**
 * Delete media asset
 * DELETE /api/media/:assetId
 */
export async function deleteMedia(request, assetId) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const db = getAdminClient();

  // Get asset to check ownership and get public_id for Cloudinary deletion
  let query = db
    .from('social_assets')
    .select('asset_id, storage_public_id, client_id')
    .eq('asset_id', assetId);

  if (!isAdmin) {
    query = query.eq('client_id', client_id);
  }

  const { data: asset, error: checkError } = await query.single();

  if (checkError || !asset) {
    return error('Asset not found', 404);
  }

  // Delete from database first
  const { error: dbError } = await db
    .from('social_assets')
    .delete()
    .eq('asset_id', assetId);

  if (dbError) {
    console.error('Delete media error:', dbError);
    return error(`Failed to delete asset: ${dbError.message}`, 500);
  }

  // Optionally delete from Cloudinary (fire and forget)
  if (asset.storage_public_id && process.env.CLOUDINARY_API_SECRET) {
    try {
      await cloudinary.uploader.destroy(asset.storage_public_id);
    } catch (cloudinaryError) {
      // Log but don't fail - DB record already deleted
      console.warn('Cloudinary deletion failed:', cloudinaryError);
    }
  }

  return noContent();
}

/**
 * Generate signed Cloudinary upload parameters
 * POST /api/media/sign
 *
 * Body: {
 *   folder: string (optional, default: 'tbb/{client_id}/library'),
 *   tags: string[] (optional),
 *   resource_type: 'image' | 'video' | 'auto' (default: auto)
 * }
 */
export async function getSignedUploadParams(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id } = authResult;
  const body = await parseBody(request);

  // Verify Cloudinary is configured
  if (!process.env.CLOUDINARY_API_SECRET) {
    return error('Cloudinary not configured', 500);
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = body?.folder || `tbb/${client_id}/library`;
  const tags = body?.tags || [];
  const resourceType = body?.resource_type || 'auto';

  // Parameters to sign
  const paramsToSign = {
    timestamp,
    folder,
    tags: tags.join(','),
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'techbuddy4biz_media'
  };

  // Generate signature
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET
  );

  return json({
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
    tags: tags.join(','),
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'techbuddy4biz_media',
    resource_type: resourceType
  });
}

/**
 * Increment usage count when asset is used in a post
 * Called internally when creating posts with media
 */
export async function incrementAssetUsage(assetId) {
  const db = getAdminClient();

  const { error: dbError } = await db.rpc('increment_asset_usage', {
    p_asset_id: assetId
  });

  // If RPC doesn't exist, do manual update
  if (dbError) {
    await db
      .from('social_assets')
      .update({
        used_count: db.raw('COALESCE(used_count, 0) + 1'),
        last_used_at: new Date().toISOString()
      })
      .eq('asset_id', assetId);
  }
}
