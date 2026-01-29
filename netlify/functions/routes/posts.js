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
 *   - from: start date (ISO)
 *   - to: end date (ISO)
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
    .select('post_id, platform, subject, caption, media_urls, scheduled_at, posted_at, status, approval_status, post_type, input_mode, created_at, client_id')
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
 * Creates a task in the `tasks` table for n8n to process.
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
  if (!validPlatforms.includes(body.platform.toLowerCase())) {
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

  // Get client's schedule config for approval settings
  const { data: scheduleConfig } = await db
    .from('social_schedules')
    .select('approval_mode, auto_approve_manual_posts')
    .eq('client_id', client_id)
    .eq('platform', body.platform.toLowerCase())
    .eq('is_active', true)
    .single();

  // Determine approval status based on schedule config
  // For manual posts (input_mode = 'manual'), auto-approve if configured
  const autoApprove = scheduleConfig?.auto_approve_manual_posts ?? true;
  const approvalStatus = autoApprove ? 'approved' : 'pending';

  // Prepare post data
  const postData = {
    client_id,
    platform: body.platform.toLowerCase(),
    subject: body.subject || null,
    caption: body.caption,
    client_provided_caption: body.caption,
    media_urls: body.media_urls || [],
    client_provided_media_urls: body.media_urls || [],
    scheduled_at: body.scheduled_at,
    post_type: body.post_type || 'single_image',
    input_mode: 'manual',
    status: 'ready',
    approval_status: approvalStatus
  };

  // Insert post directly into social_posts
  const { data: post, error: postError } = await db
    .from('social_posts')
    .insert(postData)
    .select()
    .single();

  if (postError) {
    console.error('Create post error:', postError);
    return error('Failed to create post', 500);
  }

  // Create a publish task for n8n to pick up at scheduled time
  const taskPayload = {
    post_id: post.post_id,
    client_id,
    platform: post.platform,
    scheduled_at: post.scheduled_at
  };

  const { error: taskError } = await db
    .from('tasks')
    .insert({
      client_id,
      task_type: 'publish_social_post',
      channel: `${post.platform}_dm`,
      due_at: post.scheduled_at,
      status: 'scheduled',
      payload: taskPayload,
      max_attempts: 3
    });

  if (taskError) {
    console.error('Create task error:', taskError);
    // Post was created, just log the task error
  }

  return created({
    post,
    message: 'Post created and scheduled'
  });
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
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
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
 * Bulk operations on multiple posts
 * Body: {
 *   action: 'delete' | 'skip' | 'approve' | 'reject',
 *   post_ids: string[] (required)
 * }
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
        .select('post_id, status, client_id')
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
      let updateData = { updated_at: new Date().toISOString() };
      
      switch (body.action) {
        case 'delete':
        case 'skip':
          updateData.status = 'cancelled';
          // Cancel associated tasks
          await db
            .from('tasks')
            .update({ status: 'cancelled' })
            .eq('payload->>post_id', postId)
            .eq('task_type', 'publish_social_post')
            .in('status', ['scheduled', 'pending']);
          break;
        case 'approve':
          updateData.approval_status = 'approved';
          break;
        case 'reject':
          updateData.approval_status = 'rejected';
          updateData.status = 'cancelled';
          break;
      }

      let updateQuery = db
        .from('social_posts')
        .update(updateData)
        .eq('post_id', postId);
      
      if (!isAdmin) {
        updateQuery = updateQuery.eq('client_id', client_id);
      }

      const { error: updateError } = await updateQuery;

      if (updateError) {
        results.failed.push({ post_id: postId, reason: updateError.message });
      } else {
        results.success.push(postId);
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