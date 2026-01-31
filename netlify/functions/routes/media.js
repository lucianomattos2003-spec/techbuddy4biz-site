/**
 * Media Library Routes
 * 
 * GET  /api/media      - List client's media assets
 * POST /api/media      - Save media record after upload
 * POST /api/media/sign - Get signed Cloudinary upload params
 */

import { getAdminClient } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';
import { json, created, error, parseBody } from '../../lib/response.js';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * List media assets for the authenticated client
 * Query params:
 *   - tags: comma-separated tags to filter by
 *   - type: 'image' | 'video' | 'all' (default: all)
 *   - limit: max results (default 50)
 *   - offset: pagination offset
 */
export async function listMedia(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id } = authResult;
  const url = new URL(request.url);
  const params = url.searchParams;

  const db = getAdminClient();
  let query = db
    .from('social_assets')
    .select('asset_id, cloudinary_url, cloudinary_public_id, filename, mime_type, size_bytes, tags, created_at')
    .eq('client_id', client_id)
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

  const limit = Math.min(parseInt(params.get('limit') || '50'), 100);
  const offset = parseInt(params.get('offset') || '0');
  query = query.range(offset, offset + limit - 1);

  const { data: assets, error: dbError } = await query;

  if (dbError) {
    console.error('List media error:', dbError);
    return error('Failed to fetch media', 500);
  }

  // Assets already have correct column names from DB
  return json({ assets: assets || [], count: (assets || []).length, limit, offset });
}

/**
 * Save media record after successful Cloudinary upload
 * Called from frontend after direct upload to Cloudinary
 * 
 * Body: {
 *   cloudinary_url: string (required),
 *   cloudinary_public_id: string (required),
 *   filename: string (optional),
 *   mime_type: string (optional),
 *   size_bytes: number (optional),
 *   tags: string[] (optional)
 * }
 */
export async function saveMediaRecord(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id } = authResult;
  const body = await parseBody(request);

  if (!body?.cloudinary_url) return error('cloudinary_url is required');
  if (!body?.cloudinary_public_id) return error('cloudinary_public_id is required');

  const db = getAdminClient();

  // DB columns match API field names
  const assetData = {
    client_id,
    cloudinary_url: body.cloudinary_url,
    cloudinary_public_id: body.cloudinary_public_id,
    filename: body.filename || null,
    mime_type: body.mime_type || null,
    size_bytes: body.size_bytes || null,
    tags: body.tags || []
  };

  const { data: asset, error: dbError } = await db
    .from('social_assets')
    .insert(assetData)
    .select()
    .single();

  if (dbError) {
    console.error('Save media error:', dbError);
    return error('Failed to save media record', 500);
  }

  return created({ asset, message: 'Media saved to library' });
}

/**
 * Generate signed Cloudinary upload parameters
 * For when unsigned uploads aren't suitable (larger files, videos)
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
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'techbuddy_unsigned'
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
    upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    resource_type: resourceType
  });
}
