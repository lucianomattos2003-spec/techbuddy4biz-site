/**
 * Schedule Configuration Routes
 * 
 * GET /api/schedule - Get client's posting schedule config
 * PUT /api/schedule - Update schedule config
 */

import { getAdminClient } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';
import { json, error, parseBody } from '../../lib/response.js';

/**
 * Get client's posting schedule configuration
 * Query params:
 *   - platform: filter by platform (optional, returns all if not specified)
 */
export async function getSchedule(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id } = authResult;
  const url = new URL(request.url);
  const platform = url.searchParams.get('platform');

  const db = getAdminClient();
  let query = db
    .from('social_schedules')
    .select('schedule_id, platform, posting_times, posting_days, schedule_mode, approval_mode, auto_approve_manual_posts, is_active, created_at, updated_at')
    .eq('client_id', client_id);

  if (platform) {
    query = query.eq('platform', platform.toLowerCase());
  }

  const { data: schedules, error: dbError } = await query;

  if (dbError) {
    console.error('Get schedule error:', dbError);
    return error('Failed to fetch schedule', 500);
  }

  // If requesting single platform, return single object
  if (platform && schedules.length === 1) {
    return json({ schedule: schedules[0] });
  }

  return json({ schedules });
}

/**
 * Update schedule configuration
 * Body: {
 *   platform: string (required),
 *   posting_times: string[] (optional, e.g., ["09:00", "15:00", "19:00"]),
 *   posting_days: string[] (optional, e.g., ["monday", "wednesday", "friday"]),
 *   schedule_mode: 'immediate' | 'next_slot' | 'spread' | 'explicit' (optional),
 *   approval_mode: 'auto' | 'email' | 'email_ai_only' (optional),
 *   auto_approve_manual_posts: boolean (optional),
 *   is_active: boolean (optional)
 * }
 */
export async function updateSchedule(request) {
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { client_id } = authResult;
  const body = await parseBody(request);

  if (!body?.platform) return error('platform is required');

  const platform = body.platform.toLowerCase();
  const validPlatforms = ['instagram', 'linkedin', 'facebook', 'twitter', 'tiktok'];
  if (!validPlatforms.includes(platform)) {
    return error(`Invalid platform. Must be one of: ${validPlatforms.join(', ')}`);
  }

  const db = getAdminClient();

  // Check if schedule exists for this platform
  const { data: existing } = await db
    .from('social_schedules')
    .select('schedule_id')
    .eq('client_id', client_id)
    .eq('platform', platform)
    .single();

  // Build update/insert object
  const scheduleData = {
    client_id,
    platform
  };

  // Validate and add optional fields
  if (body.posting_times !== undefined) {
    if (!Array.isArray(body.posting_times)) {
      return error('posting_times must be an array of time strings');
    }
    // Validate time format (HH:MM)
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
    for (const time of body.posting_times) {
      if (!timeRegex.test(time)) {
        return error(`Invalid time format: ${time}. Use HH:MM (24-hour)`);
      }
    }
    scheduleData.posting_times = body.posting_times;
  }

  if (body.posting_days !== undefined) {
    if (!Array.isArray(body.posting_days)) {
      return error('posting_days must be an array');
    }
    const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    for (const day of body.posting_days) {
      if (!validDays.includes(day.toLowerCase())) {
        return error(`Invalid day: ${day}. Must be one of: ${validDays.join(', ')}`);
      }
    }
    scheduleData.posting_days = body.posting_days.map(d => d.toLowerCase());
  }

  if (body.schedule_mode !== undefined) {
    const validModes = ['immediate', 'next_slot', 'spread', 'explicit'];
    if (!validModes.includes(body.schedule_mode)) {
      return error(`Invalid schedule_mode. Must be one of: ${validModes.join(', ')}`);
    }
    scheduleData.schedule_mode = body.schedule_mode;
  }

  if (body.approval_mode !== undefined) {
    const validApprovalModes = ['auto', 'email', 'email_ai_only'];
    if (!validApprovalModes.includes(body.approval_mode)) {
      return error(`Invalid approval_mode. Must be one of: ${validApprovalModes.join(', ')}`);
    }
    scheduleData.approval_mode = body.approval_mode;
  }

  if (body.auto_approve_manual_posts !== undefined) {
    scheduleData.auto_approve_manual_posts = Boolean(body.auto_approve_manual_posts);
  }

  if (body.is_active !== undefined) {
    scheduleData.is_active = Boolean(body.is_active);
  }

  scheduleData.updated_at = new Date().toISOString();

  let result;
  if (existing) {
    // Update existing
    const { data, error: dbError } = await db
      .from('social_schedules')
      .update(scheduleData)
      .eq('schedule_id', existing.schedule_id)
      .select()
      .single();

    if (dbError) {
      console.error('Update schedule error:', dbError);
      return error('Failed to update schedule', 500);
    }
    result = data;
  } else {
    // Insert new
    scheduleData.created_at = new Date().toISOString();
    const { data, error: dbError } = await db
      .from('social_schedules')
      .insert(scheduleData)
      .select()
      .single();

    if (dbError) {
      console.error('Insert schedule error:', dbError);
      return error('Failed to create schedule', 500);
    }
    result = data;
  }

  return json({ schedule: result, message: 'Schedule updated' });
}
