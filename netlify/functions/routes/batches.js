/**
 * Social Post Batches Routes
 * 
 * POST /api/batches     - Create a batch of posts (influencer workflow)
 * GET  /api/batches/:id - Get batch status and posts
 */

import { getAdminClient } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';
import { json, created, error, notFound, parseBody } from '../../lib/response.js';

/**
 * Create a batch of social posts
 * This is the primary endpoint for influencer batch scheduling
 * 
 * Body: {
 *   platform: string (required),
 *   batch_type: 'manual' | 'ai' (default: manual),
 *   posts: [
 *     {
 *       scheduled_at: ISO datetime (required),
 *       caption: string (required for manual),
 *       subject: string (optional),
 *       media_urls: [{ url, type, position? }] (optional),
 *       post_type: 'single_image' | 'carousel' | 'video' (default: single_image)
 *     }
 *   ]
 * }
 * 
 * Creates a `generate_social_batch` task for n8n to process.
 */
export async function createBatch(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id } = authResult;
  const body = await parseBody(request);

  // Validation
  if (!body?.platform) return error('platform is required');
  if (!body?.posts || !Array.isArray(body.posts)) return error('posts array is required');
  if (body.posts.length === 0) return error('posts array cannot be empty');
  if (body.posts.length > 100) return error('Maximum 100 posts per batch');

  const validPlatforms = ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'];
  if (!validPlatforms.includes(body.platform.toLowerCase())) {
    return error(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`);
  }

  // Validate each post in the batch
  const errors = [];
  const now = new Date();
  
  body.posts.forEach((post, index) => {
    if (!post.scheduled_at) {
      errors.push(`Post ${index + 1}: scheduled_at is required`);
    } else {
      const scheduledAt = new Date(post.scheduled_at);
      if (isNaN(scheduledAt.getTime())) {
        errors.push(`Post ${index + 1}: invalid scheduled_at date format`);
      } else if (scheduledAt < now) {
        errors.push(`Post ${index + 1}: scheduled_at must be in the future`);
      }
    }

    // For manual batches, caption is required
    if ((body.batch_type || 'manual') === 'manual' && !post.caption) {
      errors.push(`Post ${index + 1}: caption is required for manual posts`);
    }
  });

  if (errors.length > 0) {
    return error(errors.join('; '), 400);
  }

  const db = getAdminClient();
  const platform = body.platform.toLowerCase();
  const batchType = body.batch_type || 'manual';

  // Create batch record
  const { data: batch, error: batchError } = await db
    .from('social_batches')
    .insert({
      client_id,
      platform,
      batch_size: body.posts.length,
      batch_type: batchType,
      status: 'pending'
    })
    .select()
    .single();

  if (batchError) {
    console.error('Create batch error:', batchError);
    return error('Failed to create batch', 500);
  }

  // Prepare task payload for n8n
  // Format posts array to match n8n expectations
  const formattedPosts = body.posts.map((post, index) => ({
    scheduled_at: post.scheduled_at,
    client_caption: post.caption || null,
    client_subject: post.subject || `Post ${index + 1}`,
    client_media_urls: post.media_urls || [],
    post_type: post.post_type || 'single_image',
    position: index + 1
  }));

  const taskPayload = {
    batch_id: batch.batch_id,
    client_id,
    platform,
    batch_type: batchType,
    posts: formattedPosts,
    total_posts: body.posts.length
  };

  // Create task for n8n to process
  const { error: taskError } = await db
    .from('tasks')
    .insert({
      client_id,
      task_type: 'generate_social_batch',
      channel: `${platform}_dm`,
      due_at: new Date().toISOString(), // Process immediately
      status: 'scheduled',
      payload: taskPayload,
      max_attempts: 3
    });

  if (taskError) {
    console.error('Create batch task error:', taskError);
    // Update batch status to failed
    await db
      .from('social_batches')
      .update({ status: 'failed' })
      .eq('batch_id', batch.batch_id);
    return error('Failed to schedule batch processing', 500);
  }

  return created({
    batch: {
      batch_id: batch.batch_id,
      platform,
      batch_size: body.posts.length,
      batch_type: batchType,
      status: 'pending'
    },
    message: `Batch of ${body.posts.length} posts created and queued for processing`
  });
}

/**
 * Get batch status and associated posts
 */
export async function getBatch(request, batchId) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id } = authResult;
  const db = getAdminClient();

  // Get batch record
  const { data: batch, error: batchError } = await db
    .from('social_batches')
    .select('*')
    .eq('batch_id', batchId)
    .eq('client_id', client_id)
    .single();

  if (batchError || !batch) {
    return notFound('Batch not found');
  }

  // Get posts associated with this batch
  const { data: posts } = await db
    .from('social_posts')
    .select('post_id, subject, caption, media_urls, scheduled_at, status, approval_status, post_type')
    .eq('batch_id', batchId)
    .eq('client_id', client_id)
    .order('scheduled_at', { ascending: true });

  // Calculate status summary
  const statusCounts = (posts || []).reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {});

  return json({
    batch: {
      ...batch,
      posts_created: posts?.length || 0,
      status_summary: statusCounts
    },
    posts: posts || []
  });
}
