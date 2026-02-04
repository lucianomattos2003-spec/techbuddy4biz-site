/**
 * Portal Configuration Routes
 * Client-scoped settings (auto-scoped to authenticated user's client_id)
 *
 * GET  /api/portal/branding         - Get client branding
 * PUT  /api/portal/branding         - Update client branding
 * GET  /api/portal/settings         - Get all client settings
 * PUT  /api/portal/settings         - Update client settings
 * GET  /api/portal/hashtags         - List client hashtag packs
 * POST /api/portal/hashtags         - Create hashtag pack
 * PUT  /api/portal/hashtags/:id     - Update hashtag pack
 * DELETE /api/portal/hashtags/:id   - Delete hashtag pack
 * GET  /api/portal/themes           - List client themes
 * PUT  /api/portal/themes/:id       - Update theme (enable/disable only)
 */

import { getAdminClient } from '../../lib/supabase.js';
import { json, error, parseBody } from '../../lib/response.js';
import { verifyToken } from '../../lib/jwt.js';

/**
 * Extract and verify token, return user payload
 */
function extractToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

async function requireAuth(request) {
  const token = extractToken(request);
  if (!token) {
    return { error: 'Missing authorization token', status: 401 };
  }

  const payload = verifyToken(token);
  if (!payload) {
    return { error: 'Invalid or expired token', status: 401 };
  }

  // Get fresh user data
  const db = getAdminClient();
  const { data: user, error: userError } = await db
    .from('portal_users')
    .select('user_id, email, client_id, role, is_active')
    .eq('user_id', payload.user_id)
    .single();

  if (userError || !user) {
    return { error: 'User not found', status: 404 };
  }

  if (!user.is_active) {
    return { error: 'Account is disabled', status: 403 };
  }

  if (!user.client_id) {
    return { error: 'No client associated with this user', status: 403 };
  }

  return { user };
}

// ==========================================
// BRANDING
// ==========================================

/**
 * Get client branding
 * GET /api/portal/branding
 */
export async function getBranding(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const db = getAdminClient();

  const { data: branding, error: dbError } = await db
    .from('client_branding')
    .select('*')
    .eq('client_id', user.client_id)
    .single();

  if (dbError && dbError.code !== 'PGRST116') {
    console.error('Error fetching branding:', dbError);
    return error('Failed to fetch branding', 500);
  }

  // Return defaults if no branding exists
  // Note: DB column is company_tagline, not tagline
  return json({
    branding: branding || {
      client_id: user.client_id,
      primary_color: '#0ea5e9',
      secondary_color: '#fb923c',
      logo_base64: null,
      company_tagline: null
    }
  });
}

/**
 * Update client branding
 * PUT /api/portal/branding
 * Body: { logo_base64?, primary_color?, secondary_color?, tagline?, voice_tone?, brand_keywords? }
 */
export async function updateBranding(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const body = await parseBody(request);

  if (!body) {
    return error('Request body is required', 400);
  }

  const db = getAdminClient();

  // Allowed fields for client update (matching DB schema)
  // Note: DB uses company_tagline, not tagline
  const allowedFields = ['logo_base64', 'logo_mime_type', 'primary_color', 'secondary_color', 'company_tagline', 'email_footer_html'];
  const updateData = {};

  for (const field of allowedFields) {
    if (body.hasOwnProperty(field)) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return error('No valid fields to update', 400);
  }

  updateData.updated_at = new Date().toISOString();

  // Upsert branding record
  const { data: branding, error: dbError } = await db
    .from('client_branding')
    .upsert({
      client_id: user.client_id,
      ...updateData
    }, { onConflict: 'client_id' })
    .select()
    .single();

  if (dbError) {
    console.error('Error updating branding:', dbError);
    return error('Failed to update branding', 500);
  }

  return json({ success: true, branding });
}

// ==========================================
// SETTINGS (Client record fields)
// ==========================================

/**
 * Get client settings
 * GET /api/portal/settings
 * Uses existing tables: clients, social_schedules
 */
export async function getSettings(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const db = getAdminClient();

  // Get client record
  const { data: client, error: clientError } = await db
    .from('clients')
    .select('client_id, name, timezone, status')
    .eq('client_id', user.client_id)
    .single();

  if (clientError) {
    console.error('Error fetching client:', clientError);
    return error('Failed to fetch settings', 500);
  }

  // Get branding
  const { data: branding } = await db
    .from('client_branding')
    .select('*')
    .eq('client_id', user.client_id)
    .single();

  // Derive global settings from schedules (use first schedule as reference)
  // Columns that exist: schedule_id, platform, posting_times, posting_days, schedule_mode, approval_mode, auto_approve_manual_posts, is_active
  const { data: schedules } = await db
    .from('social_schedules')
    .select('approval_mode, is_active')
    .eq('client_id', user.client_id)
    .limit(1);

  const refSchedule = schedules?.[0] || {};

  // Fetch approval settings from client_rules
  const { data: rules } = await db
    .from('client_rules')
    .select('rules')
    .eq('client_id', user.client_id)
    .single();

  const approvalRules = rules?.rules || {};
  const postApproval = approvalRules.post_approval || {};
  const messageApproval = approvalRules.message_approval || {};

  // Count pending approvals for the banner
  const [{ count: pendingPosts }, { count: pendingMessages }] = await Promise.all([
    db.from('social_posts')
      .select('post_id', { count: 'exact', head: true })
      .eq('client_id', user.client_id)
      .eq('approval_status', 'pending'),
    db.from('pending_messages')
      .select('pending_message_id', { count: 'exact', head: true })
      .eq('client_id', user.client_id)
      .eq('approval_status', 'pending')
  ]);

  return json({
    settings: {
      timezone: client.timezone || 'America/New_York',
      status: client.status || 'active',
      approval_mode: refSchedule.approval_mode || 'auto',
      posting_active: refSchedule.is_active !== false,
      // Structured approval settings
      post_approval: {
        mode: refSchedule.approval_mode || 'auto',
        approval_email: postApproval.approval_email || null,
        timeout_hours: postApproval.timeout_hours || 24,
        fallback_on_timeout: postApproval.fallback_on_timeout || 'discard'
      },
      message_approval: {
        mode: messageApproval.default_mode || 'manual',
        approval_email: messageApproval.approval_email || null,
        timeout_hours: messageApproval.timeout_hours || 24,
        fallback_on_timeout: messageApproval.fallback_on_timeout || 'send',
        channels: messageApproval.channels || {}
      },
      pending_count: {
        posts: pendingPosts || 0,
        messages: pendingMessages || 0,
        total: (pendingPosts || 0) + (pendingMessages || 0)
      }
    },
    branding: branding || null
  });
}

/**
 * Update client settings
 * PUT /api/portal/settings
 * Body: { timezone?, approval_mode?, posting_active?, social_posts?, messages? }
 *
 * Updates:
 * - timezone → clients.timezone
 * - approval_mode → social_schedules.approval_mode (all schedules) [legacy]
 * - posting_active → social_schedules.is_active
 * - social_posts → social_schedules.approval_mode + client_rules.rules.post_approval
 * - messages → client_rules.rules.message_approval
 */
export async function updateSettings(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const body = await parseBody(request);

  if (!body) {
    return error('Request body is required', 400);
  }

  const db = getAdminClient();
  let clientUpdated = false;
  let schedulesUpdated = false;
  let rulesUpdated = false;

  // Update client timezone if provided
  if (body.hasOwnProperty('timezone')) {
    const { error: clientError } = await db
      .from('clients')
      .update({
        timezone: body.timezone,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', user.client_id);

    if (clientError) {
      console.error('Error updating client timezone:', clientError);
      return error('Failed to update timezone', 500);
    }
    clientUpdated = true;
  }

  // Update schedule settings if provided (applies to all schedules for this client)
  const scheduleUpdates = {};

  // Support both legacy flat `approval_mode` and new `social_posts.mode`
  const postMode = body.social_posts?.mode || body.approval_mode;
  if (postMode) {
    const validModes = ['auto', 'email', 'email_ai_only'];
    if (!validModes.includes(postMode)) {
      return error('Invalid post approval mode. Must be: auto, email, or email_ai_only', 400);
    }
    scheduleUpdates.approval_mode = postMode;
  }

  if (body.hasOwnProperty('posting_active')) {
    scheduleUpdates.is_active = Boolean(body.posting_active);
  }

  if (Object.keys(scheduleUpdates).length > 0) {
    scheduleUpdates.updated_at = new Date().toISOString();

    const { error: scheduleError } = await db
      .from('social_schedules')
      .update(scheduleUpdates)
      .eq('client_id', user.client_id);

    if (scheduleError) {
      console.error('Error updating schedules:', scheduleError);
      return error('Failed to update schedule settings', 500);
    }
    schedulesUpdated = true;
  }

  // Handle approval rules (stored in client_rules.rules JSONB)
  if (body.social_posts || body.messages) {
    // Read current rules (preserving existing keys like posting_limits)
    const { data: currentRules } = await db
      .from('client_rules')
      .select('rules')
      .eq('client_id', user.client_id)
      .single();

    const existingRules = currentRules?.rules || {};

    // Update post_approval settings
    if (body.social_posts) {
      const sp = body.social_posts;
      existingRules.post_approval = {
        ...(existingRules.post_approval || {}),
        ...(sp.approval_email !== undefined && { approval_email: sp.approval_email }),
        ...(sp.timeout_hours !== undefined && { timeout_hours: sp.timeout_hours }),
        ...(sp.fallback_on_timeout !== undefined && { fallback_on_timeout: sp.fallback_on_timeout })
      };
    }

    // Update message_approval settings
    if (body.messages) {
      const msg = body.messages;
      const validMsgModes = ['auto', 'manual', 'ai_only'];
      if (msg.mode && !validMsgModes.includes(msg.mode)) {
        return error('Invalid message approval mode. Must be: auto, manual, or ai_only', 400);
      }

      const existing = existingRules.message_approval || {};
      existingRules.message_approval = {
        ...existing,
        ...(msg.mode !== undefined && { default_mode: msg.mode }),
        ...(msg.approval_email !== undefined && { approval_email: msg.approval_email }),
        ...(msg.timeout_hours !== undefined && { timeout_hours: msg.timeout_hours }),
        ...(msg.fallback_on_timeout !== undefined && { fallback_on_timeout: msg.fallback_on_timeout }),
        ...(msg.channels !== undefined && { channels: { ...(existing.channels || {}), ...msg.channels } })
      };
    }

    const { error: rulesError } = await db
      .from('client_rules')
      .upsert({
        client_id: user.client_id,
        rules: existingRules,
        updated_at: new Date().toISOString()
      }, { onConflict: 'client_id' });

    if (rulesError) {
      console.error('Error updating approval rules:', rulesError);
      return error('Failed to update approval settings', 500);
    }
    rulesUpdated = true;
  }

  if (!clientUpdated && !schedulesUpdated && !rulesUpdated) {
    return error('No valid fields to update', 400);
  }

  // Fetch updated state
  const { data: client } = await db
    .from('clients')
    .select('timezone, status')
    .eq('client_id', user.client_id)
    .single();

  const { data: schedules } = await db
    .from('social_schedules')
    .select('approval_mode, is_active')
    .eq('client_id', user.client_id)
    .limit(1);

  const refSchedule = schedules?.[0] || {};

  const { data: updatedRules } = await db
    .from('client_rules')
    .select('rules')
    .eq('client_id', user.client_id)
    .single();

  const approvalRules = updatedRules?.rules || {};
  const postApproval = approvalRules.post_approval || {};
  const messageApproval = approvalRules.message_approval || {};

  return json({
    success: true,
    settings: {
      timezone: client?.timezone || 'America/New_York',
      status: client?.status || 'active',
      approval_mode: refSchedule.approval_mode || 'auto',
      posting_active: refSchedule.is_active !== false,
      post_approval: {
        mode: refSchedule.approval_mode || 'auto',
        approval_email: postApproval.approval_email || null,
        timeout_hours: postApproval.timeout_hours || 24,
        fallback_on_timeout: postApproval.fallback_on_timeout || 'discard'
      },
      message_approval: {
        mode: messageApproval.default_mode || 'manual',
        approval_email: messageApproval.approval_email || null,
        timeout_hours: messageApproval.timeout_hours || 24,
        fallback_on_timeout: messageApproval.fallback_on_timeout || 'send',
        channels: messageApproval.channels || {}
      }
    }
  });
}

// ==========================================
// HASHTAGS
// ==========================================

/**
 * List client hashtag packs
 * GET /api/portal/hashtags
 */
export async function listHashtags(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const db = getAdminClient();

  // Columns: pack_id, client_id, pack_key, label, category, platform, locale, hashtags, is_active
  const { data: hashtags, error: dbError } = await db
    .from('social_hashtag_packs')
    .select('*')
    .eq('client_id', user.client_id)
    .order('label');

  if (dbError) {
    console.error('Error fetching hashtags:', dbError);
    return error('Failed to fetch hashtags', 500);
  }

  return json({ hashtags: hashtags || [] });
}

/**
 * Create hashtag pack
 * POST /api/portal/hashtags
 * Body: { label, hashtags: string[], pack_key?, category?, platform?, locale? }
 *
 * DB columns: pack_id, client_id, pack_key, label, category, platform, locale, hashtags, is_active
 */
export async function createHashtag(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const body = await parseBody(request);

  if (!body?.label || !body?.hashtags) {
    return error('Label and hashtags array are required', 400);
  }

  if (!Array.isArray(body.hashtags)) {
    return error('Hashtags must be an array', 400);
  }

  const db = getAdminClient();

  // Generate pack_key from label if not provided
  const packKey = body.pack_key || body.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

  const { data: hashtag, error: dbError } = await db
    .from('social_hashtag_packs')
    .insert({
      client_id: user.client_id,
      pack_key: packKey,
      label: body.label.trim(),
      category: body.category || 'niche',
      platform: body.platform || null,
      locale: body.locale || '*',
      hashtags: body.hashtags.map(h => h.trim()),
      is_active: body.is_active !== false
    })
    .select()
    .single();

  if (dbError) {
    console.error('Error creating hashtag pack:', dbError);
    return error('Failed to create hashtag pack', 500);
  }

  return json({ success: true, hashtag });
}

/**
 * Update hashtag pack
 * PUT /api/portal/hashtags/:id
 * Body: { label?, hashtags?, category?, platform?, locale?, is_active? }
 */
export async function updateHashtag(request, packId) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const body = await parseBody(request);

  if (!body) {
    return error('Request body is required', 400);
  }

  const db = getAdminClient();

  // Verify ownership
  const { data: existing } = await db
    .from('social_hashtag_packs')
    .select('pack_id')
    .eq('pack_id', packId)
    .eq('client_id', user.client_id)
    .single();

  if (!existing) {
    return error('Hashtag pack not found', 404);
  }

  const updateData = {};
  if (body.label) updateData.label = body.label.trim();
  if (body.hashtags && Array.isArray(body.hashtags)) {
    updateData.hashtags = body.hashtags.map(h => h.trim());
  }
  if (body.hasOwnProperty('category')) updateData.category = body.category;
  if (body.hasOwnProperty('platform')) updateData.platform = body.platform;
  if (body.hasOwnProperty('locale')) updateData.locale = body.locale;
  if (body.hasOwnProperty('is_active')) updateData.is_active = body.is_active;

  updateData.updated_at = new Date().toISOString();

  const { data: hashtag, error: dbError } = await db
    .from('social_hashtag_packs')
    .update(updateData)
    .eq('pack_id', packId)
    .select()
    .single();

  if (dbError) {
    console.error('Error updating hashtag pack:', dbError);
    return error('Failed to update hashtag pack', 500);
  }

  return json({ success: true, hashtag });
}

/**
 * Delete hashtag pack
 * DELETE /api/portal/hashtags/:id
 */
export async function deleteHashtag(request, packId) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const db = getAdminClient();

  // Verify ownership
  const { data: existing } = await db
    .from('social_hashtag_packs')
    .select('pack_id')
    .eq('pack_id', packId)
    .eq('client_id', user.client_id)
    .single();

  if (!existing) {
    return error('Hashtag pack not found', 404);
  }

  const { error: dbError } = await db
    .from('social_hashtag_packs')
    .delete()
    .eq('pack_id', packId);

  if (dbError) {
    console.error('Error deleting hashtag pack:', dbError);
    return error('Failed to delete hashtag pack', 500);
  }

  return json({ success: true });
}

// ==========================================
// THEMES (Enable/Disable only for portal)
// ==========================================

/**
 * List client themes
 * GET /api/portal/themes
 *
 * DB columns: theme_id, client_id, theme_key, label, category, target_audience, pain_point,
 *             solution_hint, tone, cta_type, is_active, priority, times_used, last_used_at
 */
export async function listThemes(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const db = getAdminClient();

  const { data: themes, error: dbError } = await db
    .from('social_themes')
    .select('theme_id, theme_key, label, category, is_active, priority')
    .eq('client_id', user.client_id)
    .order('priority', { ascending: false });

  if (dbError) {
    console.error('Error fetching themes:', dbError);
    return error('Failed to fetch themes', 500);
  }

  return json({ themes: themes || [] });
}

/**
 * Update theme (enable/disable only)
 * PUT /api/portal/themes/:id
 * Body: { is_active: boolean }
 */
export async function updateTheme(request, themeId) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const body = await parseBody(request);

  if (!body || !body.hasOwnProperty('is_active')) {
    return error('is_active field is required', 400);
  }

  const db = getAdminClient();

  // Verify ownership
  const { data: existing } = await db
    .from('social_themes')
    .select('theme_id')
    .eq('theme_id', themeId)
    .eq('client_id', user.client_id)
    .single();

  if (!existing) {
    return error('Theme not found', 404);
  }

  const { data: theme, error: dbError } = await db
    .from('social_themes')
    .update({
      is_active: body.is_active,
      updated_at: new Date().toISOString()
    })
    .eq('theme_id', themeId)
    .select('theme_id, theme_key, label, category, is_active')
    .single();

  if (dbError) {
    console.error('Error updating theme:', dbError);
    return error('Failed to update theme', 500);
  }

  return json({ success: true, theme });
}

/**
 * Bulk update themes (enable/disable)
 * PATCH /api/portal/themes/bulk
 * Body: { updates: [{ theme_id, is_active }] }
 */
export async function bulkUpdateThemes(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const body = await parseBody(request);

  if (!body?.updates || !Array.isArray(body.updates)) {
    return error('updates array is required', 400);
  }

  const db = getAdminClient();
  const results = [];

  for (const update of body.updates) {
    if (!update.theme_id || !update.hasOwnProperty('is_active')) {
      continue;
    }

    const { data: theme, error: dbError } = await db
      .from('social_themes')
      .update({
        is_active: update.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('theme_id', update.theme_id)
      .eq('client_id', user.client_id)
      .select('theme_id, theme_key, label, is_active')
      .single();

    if (!dbError && theme) {
      results.push(theme);
    }
  }

  return json({ success: true, updated: results.length, themes: results });
}

// ==========================================
// SCHEDULES (Simplified for portal)
// ==========================================

/**
 * Get posting limits from client_rules
 * Returns default limits if not configured
 */
async function getPostingLimits(db, clientId) {
  const { data: rules } = await db
    .from('client_rules')
    .select('rules')
    .eq('client_id', clientId)
    .single();

  const postingLimits = rules?.rules?.posting_limits || {};

  return {
    max_posts_per_day_allowed: postingLimits.max_posts_per_day_allowed || 3,
    max_posts_per_week_allowed: postingLimits.max_posts_per_week_allowed || 14,
    max_posting_times_allowed: postingLimits.max_posting_times_allowed || 5
  };
}

/**
 * List client schedules
 * GET /api/portal/schedules
 * Returns schedules with posting limits from client_rules
 */
export async function listSchedules(request) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const db = getAdminClient();

  // Fetch schedules
  const { data: schedules, error: dbError } = await db
    .from('social_schedules')
    .select('*')
    .eq('client_id', user.client_id)
    .order('platform');

  if (dbError) {
    console.error('Error fetching schedules:', dbError);
    return error('Failed to fetch schedules', 500);
  }

  // Fetch posting limits from client_rules
  const limits = await getPostingLimits(db, user.client_id);

  return json({
    schedules: schedules || [],
    limits
  });
}

/**
 * Update schedule
 * PUT /api/portal/schedules/:id
 * Body: { posting_times?, posting_days?, max_posts_per_day?, max_posts_per_week?, is_active? }
 */
export async function updateSchedule(request, scheduleId) {
  const auth = await requireAuth(request);
  if (auth.error) {
    return error(auth.error, auth.status);
  }

  const { user } = auth;
  const body = await parseBody(request);

  if (!body) {
    return error('Request body is required', 400);
  }

  const db = getAdminClient();

  // Verify ownership
  const { data: existing } = await db
    .from('social_schedules')
    .select('schedule_id')
    .eq('schedule_id', scheduleId)
    .eq('client_id', user.client_id)
    .single();

  if (!existing) {
    return error('Schedule not found', 404);
  }

  // Get posting limits for validation
  const limits = await getPostingLimits(db, user.client_id);

  // Validate against plan limits
  if (body.max_posts_per_day !== undefined) {
    if (body.max_posts_per_day > limits.max_posts_per_day_allowed) {
      return error(`Maximum posts per day cannot exceed ${limits.max_posts_per_day_allowed} on your current plan.`, 400);
    }
    if (body.max_posts_per_day < 1) {
      return error('Maximum posts per day must be at least 1.', 400);
    }
  }

  if (body.max_posts_per_week !== undefined) {
    if (body.max_posts_per_week > limits.max_posts_per_week_allowed) {
      return error(`Maximum posts per week cannot exceed ${limits.max_posts_per_week_allowed} on your current plan.`, 400);
    }
    if (body.max_posts_per_week < 1) {
      return error('Maximum posts per week must be at least 1.', 400);
    }
  }

  if (body.posting_times !== undefined && Array.isArray(body.posting_times)) {
    if (body.posting_times.length > limits.max_posting_times_allowed) {
      return error(`Maximum posting time slots cannot exceed ${limits.max_posting_times_allowed} on your current plan.`, 400);
    }
  }

  // Only allow certain fields to be updated by portal users
  const allowedFields = ['posting_times', 'posting_days', 'max_posts_per_day', 'max_posts_per_week', 'is_active'];
  const updateData = {};

  for (const field of allowedFields) {
    if (body.hasOwnProperty(field)) {
      updateData[field] = body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return error('No valid fields to update', 400);
  }

  updateData.updated_at = new Date().toISOString();

  const { data: schedule, error: dbError } = await db
    .from('social_schedules')
    .update(updateData)
    .eq('schedule_id', scheduleId)
    .select()
    .single();

  if (dbError) {
    console.error('Error updating schedule:', dbError);
    return error('Failed to update schedule', 500);
  }

  return json({ success: true, schedule });
}
