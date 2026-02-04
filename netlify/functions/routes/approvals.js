/**
 * Unified Approval Center Routes
 *
 * GET    /api/portal/approvals                        - List all pending (posts + messages)
 * POST   /api/portal/approvals/:type/:id/approve      - Approve item
 * POST   /api/portal/approvals/:type/:id/reject       - Reject item
 * POST   /api/portal/approvals/bulk/approve            - Bulk approve
 * POST   /api/portal/approvals/bulk/reject             - Bulk reject
 */

import { getAdminClient } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';
import { json, error, parseBody } from '../../lib/response.js';

/**
 * List unified approvals (posts + messages)
 * Query params: type, channel, platform, sort, search, limit, offset
 */
export async function listApprovals(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, isAdmin } = authResult;
  const url = new URL(request.url);
  const params = url.searchParams;

  const typeFilter = params.get('type') || 'all'; // all, posts, messages
  const channelFilter = params.get('channel') || null;
  const platformFilter = params.get('platform') || null;
  const sortBy = params.get('sort') || 'urgent'; // urgent, newest
  const searchQuery = params.get('search') || null;
  const limit = Math.min(parseInt(params.get('limit') || '20'), 50);
  const offset = parseInt(params.get('offset') || '0');

  const db = getAdminClient();
  const targetClientId = isAdmin ? (params.get('client_id') || client_id) : client_id;

  try {
    const items = [];
    let pendingPostsCount = 0;
    let pendingMessagesCount = 0;
    let approvedTodayCount = 0;

    // Fetch pending posts
    if (typeFilter === 'all' || typeFilter === 'posts') {
      let postsQuery = db
        .from('social_posts')
        .select('post_id, platform, subject, caption, media_urls, scheduled_at, status, approval_status, approval_token_expires_at, post_type, created_at, hashtags, hook, theme_id')
        .eq('approval_status', 'pending');

      if (targetClientId) {
        postsQuery = postsQuery.eq('client_id', targetClientId);
      }

      if (platformFilter) {
        postsQuery = postsQuery.eq('platform', platformFilter);
      }

      if (searchQuery) {
        postsQuery = postsQuery.or(`caption.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%`);
      }

      const { data: pendingPosts, error: postsError } = await postsQuery;

      if (postsError) {
        console.error('List pending posts error:', postsError);
        return error('Failed to fetch pending posts', 500);
      }

      // Transform posts to unified shape
      for (const post of (pendingPosts || [])) {
        items.push({
          id: post.post_id,
          type: 'post',
          channel: null,
          platform: post.platform,
          recipient: null,
          recipient_name: null,
          subject: post.subject,
          content_preview: post.caption ? post.caption.substring(0, 200) : null,
          context: {
            hashtags: post.hashtags || [],
            hook: post.hook || null,
            post_type: post.post_type
          },
          media_urls: post.media_urls || [],
          expires_at: post.approval_token_expires_at,
          scheduled_at: post.scheduled_at,
          created_at: post.created_at,
          status: post.approval_status
        });
      }
    }

    // Fetch pending messages
    if (typeFilter === 'all' || typeFilter === 'messages') {
      let messagesQuery = db
        .from('pending_messages')
        .select('pending_message_id, channel, recipient_identifier, subject, body_text, conversation_context, approval_status, approval_token_expires_at, created_at, expires_at')
        .eq('approval_status', 'pending');

      if (targetClientId) {
        messagesQuery = messagesQuery.eq('client_id', targetClientId);
      }

      if (channelFilter) {
        messagesQuery = messagesQuery.eq('channel', channelFilter);
      }

      if (searchQuery) {
        messagesQuery = messagesQuery.or(`body_text.ilike.%${searchQuery}%,subject.ilike.%${searchQuery}%,recipient_identifier.ilike.%${searchQuery}%`);
      }

      const { data: pendingMessages, error: messagesError } = await messagesQuery;

      if (messagesError) {
        console.error('List pending messages error:', messagesError);
        return error('Failed to fetch pending messages', 500);
      }

      // Transform messages to unified shape
      for (const msg of (pendingMessages || [])) {
        items.push({
          id: msg.pending_message_id,
          type: 'message',
          channel: msg.channel,
          platform: null,
          recipient: msg.recipient_identifier,
          recipient_name: msg.conversation_context?.sender_name || null,
          subject: msg.subject,
          content_preview: msg.body_text ? msg.body_text.substring(0, 200) : null,
          context: {
            their_message: msg.conversation_context?.last_message || null
          },
          media_urls: null,
          expires_at: msg.approval_token_expires_at || msg.expires_at,
          scheduled_at: null,
          created_at: msg.created_at,
          status: msg.approval_status
        });
      }
    }

    // Sort items
    if (sortBy === 'urgent') {
      items.sort((a, b) => {
        const aExp = a.expires_at ? new Date(a.expires_at).getTime() : Infinity;
        const bExp = b.expires_at ? new Date(b.expires_at).getTime() : Infinity;
        return aExp - bExp;
      });
    } else {
      // newest first
      items.sort((a, b) => {
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return bDate - aDate;
      });
    }

    // Count stats (before pagination)
    pendingPostsCount = items.filter(i => i.type === 'post').length;
    pendingMessagesCount = items.filter(i => i.type === 'message').length;

    // Get approved today count
    const today = new Date().toISOString().slice(0, 10);
    const todayStart = `${today}T00:00:00Z`;
    const todayEnd = `${today}T23:59:59Z`;

    if (targetClientId) {
      // Count posts approved today
      const { count: postsApprovedToday } = await db
        .from('social_posts')
        .select('post_id', { count: 'exact', head: true })
        .eq('client_id', targetClientId)
        .eq('approval_status', 'approved')
        .gte('approved_at', todayStart)
        .lte('approved_at', todayEnd);

      // Count messages approved today
      const { count: messagesApprovedToday } = await db
        .from('pending_messages')
        .select('pending_message_id', { count: 'exact', head: true })
        .eq('client_id', targetClientId)
        .eq('approval_status', 'approved')
        .gte('approved_at', todayStart)
        .lte('approved_at', todayEnd);

      approvedTodayCount = (postsApprovedToday || 0) + (messagesApprovedToday || 0);
    }

    // Apply pagination
    const total = items.length;
    const paginatedItems = items.slice(offset, offset + limit);

    return json({
      items: paginatedItems,
      stats: {
        pending_posts: pendingPostsCount,
        pending_messages: pendingMessagesCount,
        approved_today: approvedTodayCount
      },
      total,
      limit,
      offset
    });

  } catch (err) {
    console.error('List approvals error:', err);
    return error('Failed to fetch approvals', 500);
  }
}

/**
 * Approve a single item (post or message)
 */
export async function approveItem(request, type, id) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, user, isAdmin } = authResult;
  const db = getAdminClient();
  const body = await parseBody(request);

  try {
    if (type === 'post') {
      const updateData = {
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.email,
        approval_responded_at: new Date().toISOString()
      };

      // If edited content provided, update caption
      if (body?.edited_content) {
        updateData.caption = body.edited_content;
      }

      let query = db
        .from('social_posts')
        .update(updateData)
        .eq('post_id', id)
        .eq('approval_status', 'pending');

      if (!isAdmin) {
        query = query.eq('client_id', client_id);
      }

      const { data, error: dbError } = await query.select().single();

      if (dbError) {
        console.error('Approve post error:', dbError);
        return error('Failed to approve post', 500);
      }

      if (!data) {
        return error('Post not found or already processed', 404);
      }

      return json({ success: true, type: 'post', id, status: 'approved' });

    } else if (type === 'message') {
      const updateData = {
        approval_status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: user.email
      };

      if (body?.edited_content) {
        updateData.edited_body_text = body.edited_content;
        updateData.edited_by = user.email;
        updateData.edited_at = new Date().toISOString();
      }

      let query = db
        .from('pending_messages')
        .update(updateData)
        .eq('pending_message_id', id)
        .eq('approval_status', 'pending');

      if (!isAdmin) {
        query = query.eq('client_id', client_id);
      }

      const { data, error: dbError } = await query.select().single();

      if (dbError) {
        console.error('Approve message error:', dbError);
        return error('Failed to approve message', 500);
      }

      if (!data) {
        return error('Message not found or already processed', 404);
      }

      return json({ success: true, type: 'message', id, status: 'approved' });

    } else {
      return error('Invalid type. Must be "post" or "message"', 400);
    }
  } catch (err) {
    console.error('Approve item error:', err);
    return error('Failed to approve item', 500);
  }
}

/**
 * Reject a single item (post or message)
 */
export async function rejectItem(request, type, id) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, user, isAdmin } = authResult;
  const db = getAdminClient();
  const body = await parseBody(request);

  try {
    if (type === 'post') {
      const updateData = {
        approval_status: 'rejected',
        approval_responded_at: new Date().toISOString()
      };

      let query = db
        .from('social_posts')
        .update(updateData)
        .eq('post_id', id)
        .eq('approval_status', 'pending');

      if (!isAdmin) {
        query = query.eq('client_id', client_id);
      }

      const { data, error: dbError } = await query.select().single();

      if (dbError) {
        console.error('Reject post error:', dbError);
        return error('Failed to reject post', 500);
      }

      if (!data) {
        return error('Post not found or already processed', 404);
      }

      return json({ success: true, type: 'post', id, status: 'rejected' });

    } else if (type === 'message') {
      const updateData = {
        approval_status: 'rejected',
        rejected_at: new Date().toISOString(),
        rejected_by: user.email,
        rejection_reason: body?.reason || null
      };

      let query = db
        .from('pending_messages')
        .update(updateData)
        .eq('pending_message_id', id)
        .eq('approval_status', 'pending');

      if (!isAdmin) {
        query = query.eq('client_id', client_id);
      }

      const { data, error: dbError } = await query.select().single();

      if (dbError) {
        console.error('Reject message error:', dbError);
        return error('Failed to reject message', 500);
      }

      if (!data) {
        return error('Message not found or already processed', 404);
      }

      return json({ success: true, type: 'message', id, status: 'rejected' });

    } else {
      return error('Invalid type. Must be "post" or "message"', 400);
    }
  } catch (err) {
    console.error('Reject item error:', err);
    return error('Failed to reject item', 500);
  }
}

/**
 * Bulk approve items
 * Body: { items: [{ type: "post", id: "uuid" }, ...] }
 */
export async function bulkApprove(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, user, isAdmin } = authResult;
  const db = getAdminClient();
  const body = await parseBody(request);

  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return error('Items array is required', 400);
  }

  if (body.items.length > 50) {
    return error('Maximum 50 items per bulk action', 400);
  }

  try {
    let approvedCount = 0;
    const errors = [];
    const now = new Date().toISOString();

    for (const item of body.items) {
      if (!item.type || !item.id) {
        errors.push({ id: item.id, error: 'Missing type or id' });
        continue;
      }

      if (item.type === 'post') {
        let query = db
          .from('social_posts')
          .update({
            approval_status: 'approved',
            approved_at: now,
            approved_by: user.email,
            approval_responded_at: now
          })
          .eq('post_id', item.id)
          .eq('approval_status', 'pending');

        if (!isAdmin) query = query.eq('client_id', client_id);

        const { error: dbError } = await query;
        if (dbError) {
          errors.push({ id: item.id, type: 'post', error: dbError.message });
        } else {
          approvedCount++;
        }

      } else if (item.type === 'message') {
        let query = db
          .from('pending_messages')
          .update({
            approval_status: 'approved',
            approved_at: now,
            approved_by: user.email
          })
          .eq('pending_message_id', item.id)
          .eq('approval_status', 'pending');

        if (!isAdmin) query = query.eq('client_id', client_id);

        const { error: dbError } = await query;
        if (dbError) {
          errors.push({ id: item.id, type: 'message', error: dbError.message });
        } else {
          approvedCount++;
        }
      }
    }

    return json({
      success: true,
      approved_count: approvedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('Bulk approve error:', err);
    return error('Failed to bulk approve', 500);
  }
}

/**
 * Bulk reject items
 * Body: { items: [{ type: "post", id: "uuid" }, ...] }
 */
export async function bulkReject(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id, user, isAdmin } = authResult;
  const db = getAdminClient();
  const body = await parseBody(request);

  if (!body?.items || !Array.isArray(body.items) || body.items.length === 0) {
    return error('Items array is required', 400);
  }

  if (body.items.length > 50) {
    return error('Maximum 50 items per bulk action', 400);
  }

  try {
    let rejectedCount = 0;
    const errors = [];
    const now = new Date().toISOString();

    for (const item of body.items) {
      if (!item.type || !item.id) {
        errors.push({ id: item.id, error: 'Missing type or id' });
        continue;
      }

      if (item.type === 'post') {
        let query = db
          .from('social_posts')
          .update({
            approval_status: 'rejected',
            approval_responded_at: now
          })
          .eq('post_id', item.id)
          .eq('approval_status', 'pending');

        if (!isAdmin) query = query.eq('client_id', client_id);

        const { error: dbError } = await query;
        if (dbError) {
          errors.push({ id: item.id, type: 'post', error: dbError.message });
        } else {
          rejectedCount++;
        }

      } else if (item.type === 'message') {
        let query = db
          .from('pending_messages')
          .update({
            approval_status: 'rejected',
            rejected_at: now,
            rejected_by: user.email
          })
          .eq('pending_message_id', item.id)
          .eq('approval_status', 'pending');

        if (!isAdmin) query = query.eq('client_id', client_id);

        const { error: dbError } = await query;
        if (dbError) {
          errors.push({ id: item.id, type: 'message', error: dbError.message });
        } else {
          rejectedCount++;
        }
      }
    }

    return json({
      success: true,
      rejected_count: rejectedCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    console.error('Bulk reject error:', err);
    return error('Failed to bulk reject', 500);
  }
}
