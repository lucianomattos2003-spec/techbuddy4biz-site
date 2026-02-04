/**
 * Social Posts Routes
 * 
 * GET    /api/posts      - List posts (with filters)
 * POST   /api/posts      - Create single post
 * GET    /api/posts/:id  - Get post details
 * PUT    /api/posts/:id  - Update post
 * DELETE /api/posts/:id  - Delete post
 */

import { getAdminClient } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';
import { json, created, noContent, error, notFound, parseBody } from '../../lib/response.js';

/**
 * List posts for the authenticated client
 * Query params:
 *   - status: filter by post status (scheduled, posted, failed, etc.)
 *   - platform: filter by platform (instagram, linkedin, etc.)
 *   - from: start date for scheduled_at (ISO)
 *   - to: end date for scheduled_at (ISO)
 *   - created_from: start date for created_at (ISO)
 *   - created_to: end date for created_at (ISO)
 *   - limit: max results (default 50)
 *   - offset: pagination offset
 */
export async function listPosts(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const url = new URL(request.url);
  const params = url.searchParams;

  const db = getAdminClient();
  let query = db
    .from('social_posts')
    .select('post_id, platform, subject, caption, media_urls, scheduled_at, posted_at, status, approval_status, approved_at, approved_by, approval_responded_at, post_type, input_mode, created_at, updated_at, client_id')
    .order('scheduled_at', { ascending: true, nullsFirst: false });

  // Admin can see all posts, or filter by client_id param
  // Regular users can only see their own posts
  if (isAdmin) {
    // Admin can optionally filter by client
    if (params.get('client_id')) {
      query = query.eq('client_id', params.get('client_id'));
    }
  } else {
    query = query.eq('client_id', client_id);
  }

  // Apply filters
  if (params.get('status')) {
    query = query.eq('status', params.get('status'));
  }
  if (params.get('approval_status')) {
    query = query.eq('approval_status', params.get('approval_status'));
  }
  if (params.get('platform')) {
    query = query.eq('platform', params.get('platform'));
  }
  if (params.get('from')) {
    query = query.gte('scheduled_at', params.get('from'));
  }
  if (params.get('to')) {
    query = query.lte('scheduled_at', params.get('to'));
  }
  // Filter by created_at (useful for analytics where scheduled_at may be NULL)
  if (params.get('created_from')) {
    query = query.gte('created_at', params.get('created_from'));
  }
  if (params.get('created_to')) {
    query = query.lte('created_at', params.get('created_to'));
  }

  const limit = Math.min(parseInt(params.get('limit') || '50'), 100);
  const offset = parseInt(params.get('offset') || '0');
  query = query.range(offset, offset + limit - 1);

  const { data: posts, error: dbError } = await query;

  if (dbError) {
    console.error('List posts error:', dbError);
    return error('Failed to fetch posts', 500);
  }

  return json({ posts, count: posts.length, limit, offset });
}

/**
 * Get a single post by ID
 */
export async function getPost(request, postId) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const db = getAdminClient();

  let query = db
    .from('social_posts')
    .select('*')
    .eq('post_id', postId);
  
  // Admin can see any post, regular users only their own
  if (!isAdmin) {
    query = query.eq('client_id', client_id);
  }
  
  const { data: post, error: dbError } = await query.single();

  if (dbError || !post) {
    return notFound('Post not found');
  }

  return json(post);
}

/**
 * Create a new social post
 * Body: {
 *   platform: string (required),
 *   caption: string (required),
 *   media_urls: array (optional),
 *   scheduled_at: ISO datetime (required),
 *   subject: string (optional),
 *   post_type: 'single_image' | 'carousel' | 'video' | 'text' (default: single_image)
 * }
 *
 * ✅ ARCHITECTURE COMPLIANCE:
 * Creates a task in the `tasks` table for n8n Task Runner to process.
 * Does NOT directly insert into social_posts (managed table).
 * The n8n workflow will create the post with proper validation.
 */
export async function createPost(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id: authClientId, isAdmin } = authResult;
  const body = await parseBody(request);

  // Admin must specify client_id, regular users use their own
  let client_id = authClientId;
  if (isAdmin) {
    if (!body?.client_id) return error('client_id is required for admin users');
    client_id = body.client_id;
  }

  // Validation
  if (!body?.platform) return error('platform is required');
  if (!body?.caption) return error('caption is required');
  if (!body?.scheduled_at) return error('scheduled_at is required');

  const validPlatforms = ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'];
  const platform = body.platform.toLowerCase();
  if (!validPlatforms.includes(platform)) {
    return error(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`);
  }

  // Validate scheduled_at is in the future
  const scheduledAt = new Date(body.scheduled_at);
  if (isNaN(scheduledAt.getTime())) {
    return error('Invalid scheduled_at date format');
  }
  if (scheduledAt < new Date()) {
    return error('scheduled_at must be in the future');
  }

  const db = getAdminClient();

  // Verify platform is enabled for this client
  const { data: scheduleConfig } = await db
    .from('social_schedules')
    .select('schedule_id, platform, is_active, approval_mode, auto_approve_manual_posts')
    .eq('client_id', client_id)
    .eq('platform', platform)
    .eq('is_active', true)
    .single();

  if (!scheduleConfig) {
    return error(`Platform '${platform}' is not enabled for this client. Please enable it in Settings first.`, 403);
  }

  // Validate carousel posts (Phase 3 requirement)
  const postType = body.post_type || 'single_image';
  const mediaUrls = body.media_urls || [];

  if (postType === 'carousel') {
    if (mediaUrls.length < 2) {
      return error('Carousel posts require at least 2 images', 400);
    }
    if (mediaUrls.length > 10) {
      return error('Carousel posts cannot exceed 10 images', 400);
    }
  }

  // Validate platform-specific limits
  const validationError = await validatePlatformLimits(db, platform, body.caption, mediaUrls, postType);
  if (validationError) {
    return error(validationError, 400);
  }

  // ✅ CREATE TASK FOR N8N - NOT DIRECT POST INSERT
  // The Task Runner will create the post with all proper business logic
  const taskPayload = {
    platform,
    post_type: postType,
    client_caption: body.caption,
    client_subject: body.subject || 'Manual Post',
    client_media_urls: mediaUrls,
    scheduled_at: body.scheduled_at,
    input_mode: 'full_manual' // Manual content from web UI
  };

  const { data: task, error: taskError } = await db
    .from('tasks')
    .insert({
      client_id,
      task_type: 'generate_social_content',
      channel: `${platform}_dm`,
      due_at: new Date().toISOString(), // Process immediately
      status: 'scheduled',
      payload: taskPayload,
      max_attempts: 3
    })
    .select('task_id, created_at')
    .single();

  if (taskError) {
    console.error('Create task error:', taskError);
    return error('Failed to create post task', 500);
  }

  return created({
    task_id: task.task_id,
    platform,
    scheduled_at: body.scheduled_at,
    message: 'Post creation queued. The post will be created shortly and appear in your dashboard.',
    status: 'processing'
  });
}

/**
 * Validate post against platform-specific limits
 * Queries social_platform_config table for constraints
 */
async function validatePlatformLimits(db, platform, caption, mediaUrls, postType) {
  // Get platform limits from global config table
  const { data: platformConfig } = await db
    .from('social_platform_config')
    .select('limits')
    .eq('platform', platform)
    .single();

  if (!platformConfig?.limits) {
    // No limits configured - allow it
    return null;
  }

  const limits = platformConfig.limits;

  // Validate caption length
  if (caption && limits.max_caption_length && caption.length > limits.max_caption_length) {
    return `Caption exceeds ${limits.max_caption_length} characters for ${platform}`;
  }

  // Validate hashtag count
  if (caption && limits.max_hashtags) {
    const hashtagCount = (caption.match(/#/g) || []).length;
    if (hashtagCount > limits.max_hashtags) {
      return `Too many hashtags (${hashtagCount}). ${platform} allows max ${limits.max_hashtags}`;
    }
  }

  // Validate carousel slides
  if (postType === 'carousel' && limits.max_carousel_slides) {
    if (mediaUrls.length > limits.max_carousel_slides) {
      return `Carousel cannot exceed ${limits.max_carousel_slides} slides for ${platform}`;
    }
  }

  return null; // Validation passed
}

/**
 * Update an existing post
 * Only allowed if post status is not 'posted' or 'publishing'
 */
export async function updatePost(request, postId) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const body = await parseBody(request);
  const db = getAdminClient();

  // Check post exists and is editable
  let existingQuery = db
    .from('social_posts')
    .select('post_id, status, client_id')
    .eq('post_id', postId);
  
  if (!isAdmin) {
    existingQuery = existingQuery.eq('client_id', client_id);
  }
  
  const { data: existing } = await existingQuery.single();

  if (!existing) {
    return notFound('Post not found');
  }

  const nonEditableStatuses = ['posted', 'publishing', 'cancelled'];
  if (nonEditableStatuses.includes(existing.status)) {
    return error(`Cannot edit post with status: ${existing.status}`, 400);
  }

  // Build update object (only allowed fields)
  const updates = {};
  if (body.caption !== undefined) {
    updates.caption = body.caption;
    updates.client_provided_caption = body.caption;
  }
  if (body.media_urls !== undefined) {
    updates.media_urls = body.media_urls;
    updates.client_provided_media_urls = body.media_urls;
  }
  if (body.scheduled_at !== undefined) {
    const newScheduledAt = new Date(body.scheduled_at);
    if (isNaN(newScheduledAt.getTime())) {
      return error('Invalid scheduled_at date format');
    }
    if (newScheduledAt < new Date()) {
      return error('scheduled_at must be in the future');
    }
    updates.scheduled_at = body.scheduled_at;

    // Also update the associated task's due_at
    await db
      .from('tasks')
      .update({ due_at: body.scheduled_at })
      .eq('payload->>post_id', postId)
      .eq('task_type', 'publish_social_post')
      .eq('status', 'scheduled');
  }
  if (body.subject !== undefined) updates.subject = body.subject;
  if (body.post_type !== undefined) updates.post_type = body.post_type;

  if (Object.keys(updates).length === 0) {
    return error('No valid fields to update');
  }

  updates.updated_at = new Date().toISOString();

  let updateQuery = db
    .from('social_posts')
    .update(updates)
    .eq('post_id', postId);
  
  if (!isAdmin) {
    updateQuery = updateQuery.eq('client_id', client_id);
  }
  
  const { data: post, error: dbError } = await updateQuery.select().single();

  if (dbError) {
    console.error('Update post error:', dbError);
    return error('Failed to update post', 500);
  }

  return json({ post, message: 'Post updated' });
}

/**
 * Delete a post
 * Only allowed if post status is not 'posted' or 'publishing'
 */
export async function deletePost(request, postId) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const db = getAdminClient();

  // Check post exists and is deletable
  let existingQuery = db
    .from('social_posts')
    .select('post_id, status, client_id')
    .eq('post_id', postId);
  
  if (!isAdmin) {
    existingQuery = existingQuery.eq('client_id', client_id);
  }
  
  const { data: existing } = await existingQuery.single();

  if (!existing) {
    return notFound('Post not found');
  }

  if (existing.status === 'posted') {
    return error('Cannot delete a post that has already been published', 400);
  }

  // Cancel associated task instead of deleting
  await db
    .from('tasks')
    .update({ status: 'cancelled' })
    .eq('payload->>post_id', postId)
    .eq('task_type', 'publish_social_post')
    .in('status', ['scheduled', 'pending']);

  // Mark post as cancelled (soft delete)
  let deleteQuery = db
    .from('social_posts')
    .update({
      status: 'cancelled',
      approval_status: 'rejected', // Use 'rejected' - 'skipped' is not a valid enum value
      updated_at: new Date().toISOString()
    })
    .eq('post_id', postId);
  
  if (!isAdmin) {
    deleteQuery = deleteQuery.eq('client_id', client_id);
  }
  
  const { error: dbError } = await deleteQuery;

  if (dbError) {
    console.error('Delete post error:', dbError);
    return error('Failed to delete post', 500);
  }

  return noContent();
}
/**
 * Approve a single post
 * POST /api/posts/:id/approve
 *
 * ✅ ARCHITECTURE COMPLIANCE:
 * Uses process_approval_response() database function instead of direct UPDATE
 */
export async function approvePost(request, postId) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const db = getAdminClient();

  // Get post and verify access
  let query = db
    .from('social_posts')
    .select('post_id, client_id, approval_token, approval_status, status')
    .eq('post_id', postId);

  if (!isAdmin) {
    query = query.eq('client_id', client_id);
  }

  const { data: post, error: fetchError } = await query.single();

  if (fetchError || !post) {
    return notFound('Post not found');
  }

  if (post.status === 'posted' || post.status === 'publishing') {
    return error('Cannot approve a post that is already posted or publishing', 400);
  }

  if (post.approval_status === 'approved') {
    return json({ success: true, message: 'Post already approved', post_id: postId });
  }

  // ✅ USE DATABASE FUNCTION - NOT DIRECT UPDATE
  // This ensures all business logic in the DB function is executed
  const { data: result, error: dbError } = await db.rpc('process_approval_response', {
    p_post_id: postId,
    p_token: post.approval_token,
    p_action: 'approve',
    p_responded_by: 'dashboard'
  });

  if (dbError) {
    console.error('Approval function error:', dbError);
    return error(`Approval failed: ${dbError.message}`, 500);
  }

  if (!result || result.length === 0 || !result[0]?.success) {
    return error(result?.[0]?.message || 'Approval failed', 400);
  }

  const response = result[0];

  return json({
    success: true,
    post_id: response.post_id,
    scheduled_at: response.scheduled_at,
    publish_task_id: response.publish_task_id,
    message: 'Post approved successfully'
  });
}

/**
 * Reject a single post
 * POST /api/posts/:id/reject
 *
 * ✅ ARCHITECTURE COMPLIANCE:
 * Uses process_approval_response() database function
 */
export async function rejectPost(request, postId) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const db = getAdminClient();

  // Get post and verify access
  let query = db
    .from('social_posts')
    .select('post_id, client_id, approval_token, approval_status, status')
    .eq('post_id', postId);

  if (!isAdmin) {
    query = query.eq('client_id', client_id);
  }

  const { data: post, error: fetchError } = await query.single();

  if (fetchError || !post) {
    return notFound('Post not found');
  }

  if (post.status === 'posted') {
    return error('Cannot reject a post that has already been posted', 400);
  }

  // ✅ USE DATABASE FUNCTION
  const { data: result, error: dbError } = await db.rpc('process_approval_response', {
    p_post_id: postId,
    p_token: post.approval_token,
    p_action: 'skip', // 'skip' or 'reject' both work
    p_responded_by: 'dashboard'
  });

  if (dbError) {
    console.error('Rejection function error:', dbError);
    return error(`Rejection failed: ${dbError.message}`, 500);
  }

  if (!result || result.length === 0 || !result[0]?.success) {
    return error(result?.[0]?.message || 'Rejection failed', 400);
  }

  return json({
    success: true,
    post_id: postId,
    message: 'Post rejected successfully'
  });
}

/**
 * Bulk operations on multiple posts
 * Body: {
 *   action: 'delete' | 'skip' | 'approve' | 'reject',
 *   post_ids: string[] (required)
 * }
 *
 * ✅ ARCHITECTURE COMPLIANCE:
 * Uses process_approval_response() for approve/reject actions
 */
export async function bulkAction(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const body = await parseBody(request);

  if (!body?.action) return error('action is required');
  if (!body?.post_ids || !Array.isArray(body.post_ids) || body.post_ids.length === 0) {
    return error('post_ids must be a non-empty array');
  }

  const validActions = ['delete', 'skip', 'approve', 'reject'];
  if (!validActions.includes(body.action)) {
    return error(`Invalid action. Must be one of: ${validActions.join(', ')}`);
  }

  const db = getAdminClient();
  const results = { success: [], failed: [] };

  for (const postId of body.post_ids) {
    try {
      // First verify post exists and user has access
      let checkQuery = db
        .from('social_posts')
        .select('post_id, status, client_id, approval_token, approval_status')
        .eq('post_id', postId);

      if (!isAdmin) {
        checkQuery = checkQuery.eq('client_id', client_id);
      }

      const { data: post } = await checkQuery.single();

      if (!post) {
        results.failed.push({ post_id: postId, reason: 'Post not found or access denied' });
        continue;
      }

      // Check if action is allowed based on current status
      const nonEditableStatuses = ['posted', 'publishing'];
      if (nonEditableStatuses.includes(post.status)) {
        results.failed.push({ post_id: postId, reason: `Cannot modify post with status: ${post.status}` });
        continue;
      }

      // Perform the action
      if (body.action === 'approve' || body.action === 'reject') {
        // ✅ USE DATABASE FUNCTION for approvals
        const action = body.action === 'approve' ? 'approve' : 'reject';

        const { data: result, error: dbError } = await db.rpc('process_approval_response', {
          p_post_id: postId,
          p_token: post.approval_token,
          p_action: action,
          p_responded_by: 'dashboard'
        });

        if (dbError || !result?.[0]?.success) {
          results.failed.push({
            post_id: postId,
            reason: dbError?.message || result?.[0]?.message || 'Function call failed'
          });
        } else {
          results.success.push(postId);
        }
      } else if (body.action === 'delete' || body.action === 'skip') {
        // For delete/skip, we can update directly (not workflow-managed state)
        const now = new Date().toISOString();
        console.log(`[SKIP] Processing ${body.action} for post ${postId}`);

        let updateQuery = db
          .from('social_posts')
          .update({
            status: 'cancelled',
            approval_status: 'rejected', // Use 'rejected' - 'skipped' is not a valid enum value
            updated_at: now
          })
          .eq('post_id', postId);

        if (!isAdmin) {
          updateQuery = updateQuery.eq('client_id', client_id);
        }

        const { data: updated, error: updateError } = await updateQuery.select('post_id, status, approval_status');

        console.log(`[SKIP] Update result for ${postId}:`, { updated, error: updateError?.message });

        if (updateError) {
          results.failed.push({ post_id: postId, reason: updateError.message });
        } else {
          // Cancel associated tasks
          await db
            .from('tasks')
            .update({ status: 'cancelled' })
            .eq('payload->>post_id', postId)
            .eq('task_type', 'publish_social_post')
            .in('status', ['scheduled', 'pending']);

          results.success.push(postId);
        }
      }
    } catch (e) {
      results.failed.push({ post_id: postId, reason: e.message });
    }
  }

  return json({
    action: body.action,
    total: body.post_ids.length,
    success_count: results.success.length,
    failed_count: results.failed.length,
    success: results.success,
    failed: results.failed
  });
}