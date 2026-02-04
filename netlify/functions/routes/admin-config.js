/**
 * Admin Configuration Routes
 *
 * All routes require admin authentication.
 *
 * Clients:
 *   GET  /api/admin/clients              - List all clients
 *   GET  /api/admin/clients/:id/overview - Client overview with stats
 *
 * Schedules:
 *   GET  /api/admin/clients/:id/schedules           - List schedules
 *   GET  /api/admin/clients/:id/schedules/:schedId  - Get single schedule
 *   PUT  /api/admin/clients/:id/schedules/:schedId  - Update schedule
 *   POST /api/admin/clients/:id/schedules           - Create schedule
 *   DELETE /api/admin/clients/:id/schedules/:schedId - Delete schedule
 *
 * Themes:
 *   GET  /api/admin/clients/:id/themes           - List themes
 *   PUT  /api/admin/clients/:id/themes/:themeId  - Update theme
 *   POST /api/admin/clients/:id/themes           - Create theme
 *   DELETE /api/admin/clients/:id/themes/:themeId - Delete theme
 *   PATCH /api/admin/clients/:id/themes/bulk     - Bulk enable/disable
 *
 * Prompts:
 *   GET  /api/admin/clients/:id/prompts           - List prompts
 *   PUT  /api/admin/clients/:id/prompts/:promptId - Update prompt
 *   POST /api/admin/clients/:id/prompts           - Create prompt
 *   DELETE /api/admin/clients/:id/prompts/:promptId - Delete prompt
 *
 * Rules:
 *   GET  /api/admin/clients/:id/rules    - Get client rules
 *   PUT  /api/admin/clients/:id/rules    - Update client rules
 *
 * Branding:
 *   GET  /api/admin/clients/:id/branding - Get branding
 *   PUT  /api/admin/clients/:id/branding - Update branding
 *
 * Hashtags:
 *   GET  /api/admin/clients/:id/hashtags           - List hashtag packs
 *   PUT  /api/admin/clients/:id/hashtags/:packId   - Update pack
 *   POST /api/admin/clients/:id/hashtags           - Create pack
 *   DELETE /api/admin/clients/:id/hashtags/:packId - Delete pack
 *
 * System:
 *   GET  /api/admin/system/config            - Get system config
 *   PUT  /api/admin/system/config/:key       - Update system config
 *   DELETE /api/admin/system/config/:key     - Delete system config
 *   GET  /api/admin/system/platforms         - Get platform configs
 *   PUT  /api/admin/system/platforms/:platform - Update platform config
 */

import { getAdminClient } from '../../lib/supabase.js';
import { requireAdmin } from '../../lib/auth.js';
import { json, created, error, parseBody } from '../../lib/response.js';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Log an audit event
 */
async function logAudit(db, {
  clientId,
  actorId,
  action,
  entityType,
  entityId,
  oldValue,
  newValue,
  ipAddress,
  userAgent
}) {
  try {
    const { error: insertError } = await db.from('admin_audit_log').insert({
      client_id: clientId,
      actor_id: actorId,
      actor_type: 'admin',
      action,
      entity_type: entityType,
      entity_id: entityId,
      old_value: oldValue,
      new_value: newValue,
      ip_address: ipAddress || 'unknown',
      user_agent: userAgent || 'unknown'
    });

    if (insertError) {
      console.error('Failed to log audit event:', insertError.message, insertError.code, insertError.details);
    }
  } catch (err) {
    console.error('Failed to log audit event (exception):', err);
  }
}

/**
 * Get request metadata for audit logging
 */
function getRequestMeta(request) {
  return {
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown'
  };
}

// ============================================================================
// CLIENT ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/clients - List all clients
 */
export async function listClients(request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  const { data, error: dbError } = await db
    .from('clients')
    .select('*')
    .order('name');

  if (dbError) {
    console.error('List clients error:', dbError);
    return error('Failed to list clients', 500);
  }

  return json({ clients: data || [] });
}

/**
 * PUT /api/admin/clients/:id - Update client settings
 * Body: { is_active?: boolean, onboarding_completed?: boolean, name?: string, ... }
 */
export async function updateClient(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body) {
    return error('Request body is required', 400);
  }

  const db = getAdminClient();

  // Only allow updating specific fields
  const allowedFields = ['status', 'onboarding_completed', 'name', 'industry', 'timezone', 'email'];
  const updates = {};

  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      updates[field] = body[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    return error('No valid fields to update', 400);
  }

  updates.updated_at = new Date().toISOString();

  const { data, error: dbError } = await db
    .from('clients')
    .update(updates)
    .eq('client_id', clientId)
    .select()
    .single();

  if (dbError) {
    console.error('Update client error:', dbError);
    return error('Failed to update client', 500);
  }

  // Log the change
  await logAuditEvent(db, authResult.user.id, 'client.updated', clientId, updates);

  return json({ client: data });
}

/**
 * GET /api/admin/clients/:id/overview - Client overview with stats
 */
export async function getClientOverview(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  // Get client info
  const { data: client, error: clientError } = await db
    .from('clients')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (clientError || !client) {
    return error('Client not found', 404);
  }

  // Get stats in parallel
  const [themesResult, promptsResult, schedulesResult, postsResult, tasksResult] = await Promise.all([
    db.from('social_themes').select('theme_id, is_active').eq('client_id', clientId),
    db.from('social_prompts').select('prompt_id, is_active').eq('client_id', clientId),
    db.from('social_schedules').select('schedule_id, platform, is_active').eq('client_id', clientId),
    db.from('social_posts').select('post_id, status').eq('client_id', clientId).in('status', ['pending_approval', 'scheduled']),
    db.from('task_queue').select('task_id, status').eq('client_id', clientId).eq('status', 'failed')
  ]);

  const themes = themesResult.data || [];
  const prompts = promptsResult.data || [];
  const schedules = schedulesResult.data || [];
  const posts = postsResult.data || [];
  const failedTasks = tasksResult.data || [];

  // Get recent activity
  const { data: recentPosts } = await db
    .from('social_posts')
    .select('post_id, status, created_at, published_at')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
    .limit(5);

  return json({
    client,
    stats: {
      themes: {
        active: themes.filter(t => t.is_active).length,
        total: themes.length
      },
      prompts: {
        active: prompts.filter(p => p.is_active).length,
        total: prompts.length
      },
      schedules: {
        active: schedules.filter(s => s.is_active).length,
        total: schedules.length
      },
      pendingPosts: posts.filter(p => p.status === 'pending_approval').length,
      scheduledPosts: posts.filter(p => p.status === 'scheduled').length,
      failedTasks: failedTasks.length
    },
    recentActivity: {
      lastPostGenerated: recentPosts?.[0]?.created_at || null,
      lastPostPublished: recentPosts?.find(p => p.published_at)?.published_at || null,
      recentPosts: recentPosts || []
    }
  });
}

// ============================================================================
// SCHEDULE ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/clients/:id/schedules - List schedules
 */
export async function listSchedules(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  const { data, error: dbError } = await db
    .from('social_schedules')
    .select('*')
    .eq('client_id', clientId)
    .order('platform');

  if (dbError) {
    console.error('List schedules error:', dbError);
    return error('Failed to list schedules', 500);
  }

  return json({ schedules: data || [] });
}

/**
 * GET /api/admin/clients/:id/schedules/:scheduleId - Get single schedule
 */
export async function getSchedule(request, clientId, scheduleId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  const { data, error: dbError } = await db
    .from('social_schedules')
    .select('*')
    .eq('client_id', clientId)
    .eq('schedule_id', scheduleId)
    .single();

  if (dbError || !data) {
    return error('Schedule not found', 404);
  }

  return json({ schedule: data });
}

/**
 * PUT /api/admin/clients/:id/schedules/:scheduleId - Update schedule
 */
export async function updateSchedule(request, clientId, scheduleId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body) return error('Invalid request body', 400);

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  // Get current schedule for audit
  const { data: current } = await db
    .from('social_schedules')
    .select('*')
    .eq('schedule_id', scheduleId)
    .single();

  // Validate posting_times (flat array of HH:MM strings)
  if (body.posting_times) {
    if (!Array.isArray(body.posting_times)) {
      return error('posting_times must be an array', 400);
    }
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    for (const time of body.posting_times) {
      if (typeof time !== 'string' || !timeRegex.test(time)) {
        return error(`Invalid time format: ${time}. Use HH:MM format`, 400);
      }
    }
  }

  // Validate posting_days (flat array of integers 0-6)
  if (body.posting_days) {
    if (!Array.isArray(body.posting_days)) {
      return error('posting_days must be an array', 400);
    }
    for (const day of body.posting_days) {
      if (typeof day !== 'number' || day < 0 || day > 6) {
        return error(`Invalid day: ${day}. Use integers 0-6`, 400);
      }
    }
  }

  // Validate approval_mode
  if (body.approval_mode && !['auto', 'email', 'dashboard'].includes(body.approval_mode)) {
    return error('Invalid approval_mode. Use: auto, email, or dashboard', 400);
  }

  // Validate approval_email if mode is email
  if (body.approval_mode === 'email' && !body.approval_email) {
    return error('approval_email is required when approval_mode is email', 400);
  }

  const { data, error: dbError } = await db
    .from('social_schedules')
    .update({
      ...body,
      updated_at: new Date().toISOString()
    })
    .eq('client_id', clientId)
    .eq('schedule_id', scheduleId)
    .select()
    .single();

  if (dbError) {
    console.error('Update schedule error:', dbError);
    return error('Failed to update schedule', 500);
  }

  // Log audit
  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'update_schedule',
    entityType: 'social_schedules',
    entityId: scheduleId,
    oldValue: current,
    newValue: data,
    ...meta
  });

  return json({ schedule: data, message: 'Schedule updated successfully' });
}

/**
 * POST /api/admin/clients/:id/schedules - Create schedule
 */
export async function createSchedule(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body?.platform) return error('platform is required', 400);

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  // Check if schedule already exists for this platform
  const { data: existing } = await db
    .from('social_schedules')
    .select('schedule_id')
    .eq('client_id', clientId)
    .eq('platform', body.platform)
    .single();

  if (existing) {
    return error(`Schedule for ${body.platform} already exists`, 400);
  }

  const { data, error: dbError } = await db
    .from('social_schedules')
    .insert({
      client_id: clientId,
      platform: body.platform,
      posting_times: body.posting_times || ['09:00', '18:00'],
      posting_days: body.posting_days || [1, 2, 3, 4, 5],
      is_active: body.is_active !== false,
      approval_mode: body.approval_mode || 'email',
      approval_email: body.approval_email || null,
      max_posts_per_day: body.max_posts_per_day || 1,
      max_posts_per_week: body.max_posts_per_week || 7,
      locale: body.locale || 'en',
      settings: body.settings || {}
    })
    .select()
    .single();

  if (dbError) {
    console.error('Create schedule error:', dbError);
    return error('Failed to create schedule', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'create_schedule',
    entityType: 'social_schedules',
    entityId: data.schedule_id,
    oldValue: null,
    newValue: data,
    ...meta
  });

  return created({ schedule: data, message: 'Schedule created successfully' });
}

/**
 * DELETE /api/admin/clients/:id/schedules/:scheduleId - Delete schedule
 */
export async function deleteSchedule(request, clientId, scheduleId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  // Get current for audit
  const { data: current } = await db
    .from('social_schedules')
    .select('*')
    .eq('schedule_id', scheduleId)
    .single();

  const { error: dbError } = await db
    .from('social_schedules')
    .delete()
    .eq('client_id', clientId)
    .eq('schedule_id', scheduleId);

  if (dbError) {
    console.error('Delete schedule error:', dbError);
    return error('Failed to delete schedule', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'delete_schedule',
    entityType: 'social_schedules',
    entityId: scheduleId,
    oldValue: current,
    newValue: null,
    ...meta
  });

  return json({ message: 'Schedule deleted successfully' });
}

// ============================================================================
// THEMES ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/clients/:id/themes - List themes
 */
export async function listThemes(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();
  const url = new URL(request.url);
  const activeOnly = url.searchParams.get('active') === 'true';

  let query = db
    .from('social_themes')
    .select('*')
    .eq('client_id', clientId)
    .order('priority', { ascending: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error: dbError } = await query;

  if (dbError) {
    console.error('List themes error:', dbError);
    return error('Failed to list themes', 500);
  }

  return json({ themes: data || [] });
}

/**
 * GET /api/admin/clients/:id/themes/:themeId - Get single theme
 */
export async function getTheme(request, clientId, themeId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  const { data, error: dbError } = await db
    .from('social_themes')
    .select('*')
    .eq('client_id', clientId)
    .eq('theme_id', themeId)
    .single();

  if (dbError || !data) {
    return error('Theme not found', 404);
  }

  return json({ theme: data });
}

/**
 * PUT /api/admin/clients/:id/themes/:themeId - Update theme
 */
export async function updateTheme(request, clientId, themeId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body) return error('Invalid request body', 400);

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  // Get current for audit
  const { data: current } = await db
    .from('social_themes')
    .select('*')
    .eq('theme_id', themeId)
    .single();

  // Validate category
  const validCategories = ['pain_point', 'success_story', 'educational', 'behind_scenes', 'trending', 'promotional'];
  if (body.category && !validCategories.includes(body.category)) {
    return error(`Invalid category. Use: ${validCategories.join(', ')}`, 400);
  }

  // Validate cta_type
  const validCtaTypes = ['dm_keyword', 'link_bio', 'comment', 'share', 'save'];
  if (body.cta_type && !validCtaTypes.includes(body.cta_type)) {
    return error(`Invalid cta_type. Use: ${validCtaTypes.join(', ')}`, 400);
  }

  // Validate priority
  if (body.priority !== undefined && (body.priority < 1 || body.priority > 100)) {
    return error('priority must be between 1 and 100', 400);
  }

  const { data, error: dbError } = await db
    .from('social_themes')
    .update({
      ...body,
      updated_at: new Date().toISOString()
    })
    .eq('client_id', clientId)
    .eq('theme_id', themeId)
    .select()
    .single();

  if (dbError) {
    console.error('Update theme error:', dbError);
    return error('Failed to update theme', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'update_theme',
    entityType: 'social_themes',
    entityId: themeId,
    oldValue: current,
    newValue: data,
    ...meta
  });

  return json({ theme: data, message: 'Theme updated successfully' });
}

/**
 * POST /api/admin/clients/:id/themes - Create theme
 */
export async function createTheme(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body?.theme_key || !body?.label) {
    return error('theme_key and label are required', 400);
  }

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data, error: dbError } = await db
    .from('social_themes')
    .insert({
      client_id: clientId,
      theme_key: body.theme_key,
      label: body.label,
      category: body.category || 'educational',
      target_audience: body.target_audience || '',
      pain_point: body.pain_point || '',
      solution_hint: body.solution_hint || '',
      tone: body.tone || '',
      cta_type: body.cta_type || 'dm_keyword',
      example_hooks: body.example_hooks || [],
      priority: body.priority || 50,
      min_days_between_uses: body.min_days_between_uses || 5,
      is_active: body.is_active !== false
    })
    .select()
    .single();

  if (dbError) {
    console.error('Create theme error:', dbError);
    return error('Failed to create theme', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'create_theme',
    entityType: 'social_themes',
    entityId: data.theme_id,
    oldValue: null,
    newValue: data,
    ...meta
  });

  return created({ theme: data, message: 'Theme created successfully' });
}

/**
 * DELETE /api/admin/clients/:id/themes/:themeId - Delete theme
 */
export async function deleteTheme(request, clientId, themeId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data: current } = await db
    .from('social_themes')
    .select('*')
    .eq('theme_id', themeId)
    .single();

  const { error: dbError } = await db
    .from('social_themes')
    .delete()
    .eq('client_id', clientId)
    .eq('theme_id', themeId);

  if (dbError) {
    console.error('Delete theme error:', dbError);
    return error('Failed to delete theme', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'delete_theme',
    entityType: 'social_themes',
    entityId: themeId,
    oldValue: current,
    newValue: null,
    ...meta
  });

  return json({ message: 'Theme deleted successfully' });
}

/**
 * PATCH /api/admin/clients/:id/themes/bulk - Bulk enable/disable themes
 */
export async function bulkUpdateThemes(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body?.theme_ids || !Array.isArray(body.theme_ids)) {
    return error('theme_ids array is required', 400);
  }

  const action = body.action; // 'enable', 'disable', 'reset_usage'
  if (!['enable', 'disable', 'reset_usage'].includes(action)) {
    return error('action must be: enable, disable, or reset_usage', 400);
  }

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  let updateData = {};
  if (action === 'enable') updateData = { is_active: true };
  else if (action === 'disable') updateData = { is_active: false };
  else if (action === 'reset_usage') updateData = { times_used: 0, last_used_at: null };

  const { data, error: dbError } = await db
    .from('social_themes')
    .update(updateData)
    .eq('client_id', clientId)
    .in('theme_id', body.theme_ids)
    .select();

  if (dbError) {
    console.error('Bulk update themes error:', dbError);
    return error('Failed to update themes', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: `bulk_${action}_themes`,
    entityType: 'social_themes',
    entityId: body.theme_ids.join(','),
    oldValue: null,
    newValue: { action, count: data?.length || 0 },
    ...meta
  });

  return json({ themes: data, message: `${data?.length || 0} themes updated` });
}

// ============================================================================
// PROMPTS ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/clients/:id/prompts - List prompts
 */
export async function listPrompts(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  const { data, error: dbError } = await db
    .from('social_prompts')
    .select('*')
    .eq('client_id', clientId)
    .order('prompt_type');

  if (dbError) {
    console.error('List prompts error:', dbError);
    return error('Failed to list prompts', 500);
  }

  return json({ prompts: data || [] });
}

/**
 * PUT /api/admin/clients/:id/prompts/:promptId - Update prompt
 */
export async function updatePrompt(request, clientId, promptId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body) return error('Invalid request body', 400);

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data: current } = await db
    .from('social_prompts')
    .select('*')
    .eq('prompt_id', promptId)
    .single();

  // Validate temperature
  if (body.temperature !== undefined && (body.temperature < 0 || body.temperature > 2)) {
    return error('temperature must be between 0 and 2', 400);
  }

  // Validate max_tokens
  if (body.max_tokens !== undefined && (body.max_tokens < 100 || body.max_tokens > 8000)) {
    return error('max_tokens must be between 100 and 8000', 400);
  }

  const { data, error: dbError } = await db
    .from('social_prompts')
    .update({
      ...body,
      updated_at: new Date().toISOString()
    })
    .eq('client_id', clientId)
    .eq('prompt_id', promptId)
    .select()
    .single();

  if (dbError) {
    console.error('Update prompt error:', dbError);
    return error('Failed to update prompt', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'update_prompt',
    entityType: 'social_prompts',
    entityId: promptId,
    oldValue: current,
    newValue: data,
    ...meta
  });

  return json({ prompt: data, message: 'Prompt updated successfully' });
}

/**
 * POST /api/admin/clients/:id/prompts - Create prompt
 */
export async function createPrompt(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body?.prompt_type || !body?.prompt_text) {
    return error('prompt_type and prompt_text are required', 400);
  }

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data, error: dbError } = await db
    .from('social_prompts')
    .insert({
      client_id: clientId,
      prompt_type: body.prompt_type,
      platform: body.platform || null,
      prompt_text: body.prompt_text,
      model: body.model || 'gpt-4o',
      temperature: body.temperature || 0.8,
      max_tokens: body.max_tokens || 1500,
      is_active: body.is_active !== false
    })
    .select()
    .single();

  if (dbError) {
    console.error('Create prompt error:', dbError);
    return error('Failed to create prompt', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'create_prompt',
    entityType: 'social_prompts',
    entityId: data.prompt_id,
    oldValue: null,
    newValue: data,
    ...meta
  });

  return created({ prompt: data, message: 'Prompt created successfully' });
}

/**
 * DELETE /api/admin/clients/:id/prompts/:promptId - Delete prompt
 */
export async function deletePrompt(request, clientId, promptId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data: current } = await db
    .from('social_prompts')
    .select('*')
    .eq('prompt_id', promptId)
    .single();

  const { error: dbError } = await db
    .from('social_prompts')
    .delete()
    .eq('client_id', clientId)
    .eq('prompt_id', promptId);

  if (dbError) {
    console.error('Delete prompt error:', dbError);
    return error('Failed to delete prompt', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'delete_prompt',
    entityType: 'social_prompts',
    entityId: promptId,
    oldValue: current,
    newValue: null,
    ...meta
  });

  return json({ message: 'Prompt deleted successfully' });
}

// ============================================================================
// RULES ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/clients/:id/rules - Get client rules
 */
export async function getRules(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  const { data, error: dbError } = await db
    .from('client_rules')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (dbError && dbError.code !== 'PGRST116') {
    console.error('Get rules error:', dbError);
    return error('Failed to get rules', 500);
  }

  return json({ rules: data || null });
}

/**
 * PUT /api/admin/clients/:id/rules - Update client rules
 */
export async function updateRules(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body?.rules) return error('rules object is required', 400);

  // Validate JSON structure
  try {
    if (typeof body.rules === 'string') {
      JSON.parse(body.rules);
    }
  } catch (e) {
    return error('Invalid JSON in rules', 400);
  }

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  // Get current for audit
  const { data: current } = await db
    .from('client_rules')
    .select('*')
    .eq('client_id', clientId)
    .single();

  // Upsert rules
  const { data, error: dbError } = await db
    .from('client_rules')
    .upsert({
      client_id: clientId,
      rules: typeof body.rules === 'string' ? JSON.parse(body.rules) : body.rules,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'client_id'
    })
    .select()
    .single();

  if (dbError) {
    console.error('Update rules error:', dbError);
    return error('Failed to update rules', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'update_rules',
    entityType: 'client_rules',
    entityId: clientId,
    oldValue: current,
    newValue: data,
    ...meta
  });

  return json({ rules: data, message: 'Rules updated successfully' });
}

// ============================================================================
// BRANDING ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/clients/:id/branding - Get branding
 */
export async function getBranding(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  const { data, error: dbError } = await db
    .from('client_branding')
    .select('*')
    .eq('client_id', clientId)
    .single();

  if (dbError && dbError.code !== 'PGRST116') {
    console.error('Get branding error:', dbError);
    return error('Failed to get branding', 500);
  }

  return json({ branding: data || null });
}

/**
 * PUT /api/admin/clients/:id/branding - Update branding
 */
export async function updateBranding(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body) return error('Invalid request body', 400);

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data: current } = await db
    .from('client_branding')
    .select('*')
    .eq('client_id', clientId)
    .single();

  // Validate color formats
  const colorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (body.primary_color && !colorRegex.test(body.primary_color)) {
    return error('Invalid primary_color format. Use #RRGGBB', 400);
  }
  if (body.secondary_color && !colorRegex.test(body.secondary_color)) {
    return error('Invalid secondary_color format. Use #RRGGBB', 400);
  }

  // Build update data with allowed fields
  // DB columns: logo_base64, logo_mime_type, logo_url, primary_color, secondary_color, company_tagline, email_footer_html
  const updateData = {
    client_id: clientId,
    updated_at: new Date().toISOString()
  };

  // Map allowed fields (handle both frontend naming conventions)
  if (body.hasOwnProperty('logo_url')) updateData.logo_url = body.logo_url;
  if (body.hasOwnProperty('logo_base64')) updateData.logo_base64 = body.logo_base64;
  if (body.hasOwnProperty('logo_mime_type')) updateData.logo_mime_type = body.logo_mime_type;
  if (body.hasOwnProperty('primary_color')) updateData.primary_color = body.primary_color;
  if (body.hasOwnProperty('secondary_color')) updateData.secondary_color = body.secondary_color;
  // Handle both tagline and company_tagline
  if (body.hasOwnProperty('company_tagline')) updateData.company_tagline = body.company_tagline;
  else if (body.hasOwnProperty('tagline')) updateData.company_tagline = body.tagline;
  // Handle both email_footer and email_footer_html
  if (body.hasOwnProperty('email_footer_html')) updateData.email_footer_html = body.email_footer_html;
  else if (body.hasOwnProperty('email_footer')) updateData.email_footer_html = body.email_footer;

  const { data, error: dbError } = await db
    .from('client_branding')
    .upsert(updateData, {
      onConflict: 'client_id'
    })
    .select()
    .single();

  if (dbError) {
    console.error('Update branding error:', dbError);
    return error('Failed to update branding', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'update_branding',
    entityType: 'client_branding',
    entityId: clientId,
    oldValue: current,
    newValue: data,
    ...meta
  });

  return json({ branding: data, message: 'Branding updated successfully' });
}

// ============================================================================
// HASHTAGS ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/clients/:id/hashtags - List hashtag packs
 */
export async function listHashtags(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  const { data, error: dbError } = await db
    .from('social_hashtag_packs')
    .select('*')
    .eq('client_id', clientId)
    .order('pack_key');

  if (dbError) {
    console.error('List hashtags error:', dbError);
    return error('Failed to list hashtags', 500);
  }

  return json({ hashtags: data || [] });
}

/**
 * PUT /api/admin/clients/:id/hashtags/:packId - Update hashtag pack
 */
export async function updateHashtag(request, clientId, packId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body) return error('Invalid request body', 400);

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data: current } = await db
    .from('social_hashtag_packs')
    .select('*')
    .eq('pack_id', packId)
    .single();

  // Validate category
  const validCategories = ['branded', 'engagement', 'niche', 'broad'];
  if (body.category && !validCategories.includes(body.category)) {
    return error(`Invalid category. Use: ${validCategories.join(', ')}`, 400);
  }

  const { data, error: dbError } = await db
    .from('social_hashtag_packs')
    .update({
      ...body,
      updated_at: new Date().toISOString()
    })
    .eq('client_id', clientId)
    .eq('pack_id', packId)
    .select()
    .single();

  if (dbError) {
    console.error('Update hashtag error:', dbError);
    return error('Failed to update hashtag pack', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'update_hashtag',
    entityType: 'social_hashtag_packs',
    entityId: packId,
    oldValue: current,
    newValue: data,
    ...meta
  });

  return json({ hashtag: data, message: 'Hashtag pack updated successfully' });
}

/**
 * POST /api/admin/clients/:id/hashtags - Create hashtag pack
 */
export async function createHashtag(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body?.pack_key || !body?.label) {
    return error('pack_key and label are required', 400);
  }

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data, error: dbError } = await db
    .from('social_hashtag_packs')
    .insert({
      client_id: clientId,
      pack_key: body.pack_key,
      label: body.label,
      category: body.category || 'niche',
      platform: body.platform || null,
      locale: body.locale || '*',
      hashtags: body.hashtags || [],
      is_active: body.is_active !== false
    })
    .select()
    .single();

  if (dbError) {
    console.error('Create hashtag error:', dbError);
    return error('Failed to create hashtag pack', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'create_hashtag',
    entityType: 'social_hashtag_packs',
    entityId: data.pack_id,
    oldValue: null,
    newValue: data,
    ...meta
  });

  return created({ hashtag: data, message: 'Hashtag pack created successfully' });
}

/**
 * DELETE /api/admin/clients/:id/hashtags/:packId - Delete hashtag pack
 */
export async function deleteHashtag(request, clientId, packId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data: current } = await db
    .from('social_hashtag_packs')
    .select('*')
    .eq('pack_id', packId)
    .single();

  const { error: dbError } = await db
    .from('social_hashtag_packs')
    .delete()
    .eq('client_id', clientId)
    .eq('pack_id', packId);

  if (dbError) {
    console.error('Delete hashtag error:', dbError);
    return error('Failed to delete hashtag pack', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'delete_hashtag',
    entityType: 'social_hashtag_packs',
    entityId: packId,
    oldValue: current,
    newValue: null,
    ...meta
  });

  return json({ message: 'Hashtag pack deleted successfully' });
}

// ============================================================================
// SYSTEM CONFIG ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/system/config - Get all system config
 */
export async function getSystemConfig(request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  const { data, error: dbError } = await db
    .from('system_config')
    .select('*')
    .order('config_key');

  if (dbError) {
    console.error('Get system config error:', dbError);
    return error('Failed to get system config', 500);
  }

  return json({ config: data || [] });
}

/**
 * PUT /api/admin/system/config/:key - Update system config
 */
export async function updateSystemConfig(request, configKey) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (body?.value === undefined) return error('value is required', 400);

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data: current } = await db
    .from('system_config')
    .select('*')
    .eq('config_key', configKey)
    .single();

  const { data, error: dbError } = await db
    .from('system_config')
    .upsert({
      config_key: configKey,
      config_value: body.value,
      description: body.description || current?.description,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'config_key'
    })
    .select()
    .single();

  if (dbError) {
    console.error('Update system config error:', dbError);
    return error('Failed to update system config', 500);
  }

  await logAudit(db, {
    clientId: null,
    actorId: authResult.user.id,
    action: 'update_system_config',
    entityType: 'system_config',
    entityId: configKey,
    oldValue: current,
    newValue: data,
    ...meta
  });

  return json({ config: data, message: 'System config updated successfully' });
}

/**
 * DELETE /api/admin/system/config/:key - Delete system config
 */
export async function deleteSystemConfig(request, configKey) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  // Get current value for audit log
  const { data: current } = await db
    .from('system_config')
    .select('*')
    .eq('config_key', configKey)
    .single();

  if (!current) {
    return error('Config not found', 404);
  }

  const { error: dbError } = await db
    .from('system_config')
    .delete()
    .eq('config_key', configKey);

  if (dbError) {
    console.error('Delete system config error:', dbError);
    return error('Failed to delete system config', 500);
  }

  await logAudit(db, {
    clientId: null,
    actorId: authResult.user.id,
    action: 'delete_system_config',
    entityType: 'system_config',
    entityId: configKey,
    oldValue: current,
    newValue: null,
    ...meta
  });

  return json({ message: 'System config deleted successfully' });
}

/**
 * GET /api/admin/system/platforms - Get platform configs
 */
export async function getPlatformConfigs(request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();

  const { data, error: dbError } = await db
    .from('social_platform_config')
    .select('*')
    .order('platform');

  if (dbError) {
    console.error('Get platform configs error:', dbError);
    return error('Failed to get platform configs', 500);
  }

  return json({ platforms: data || [] });
}

/**
 * PUT /api/admin/system/platforms/:platform - Update platform config
 */
export async function updatePlatformConfig(request, platform) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const body = await parseBody(request);
  if (!body) return error('Invalid request body', 400);

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data: current } = await db
    .from('social_platform_config')
    .select('*')
    .eq('platform', platform)
    .single();

  const { data, error: dbError } = await db
    .from('social_platform_config')
    .upsert({
      platform,
      ...body,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'platform'
    })
    .select()
    .single();

  if (dbError) {
    console.error('Update platform config error:', dbError);
    return error('Failed to update platform config', 500);
  }

  await logAudit(db, {
    clientId: null,
    actorId: authResult.user.id,
    action: 'update_platform_config',
    entityType: 'social_platform_config',
    entityId: platform,
    oldValue: current,
    newValue: data,
    ...meta
  });

  return json({ platform: data, message: 'Platform config updated successfully' });
}

// ============================================================================
// QUICK ACTIONS
// ============================================================================

/**
 * POST /api/admin/clients/:id/actions/reset-failed-tasks - Reset failed tasks
 */
export async function resetFailedTasks(request, clientId) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();
  const meta = getRequestMeta(request);

  const { data, error: dbError } = await db
    .from('task_queue')
    .update({
      status: 'pending',
      error_message: null,
      retry_count: 0,
      updated_at: new Date().toISOString()
    })
    .eq('client_id', clientId)
    .eq('status', 'failed')
    .select();

  if (dbError) {
    console.error('Reset failed tasks error:', dbError);
    return error('Failed to reset tasks', 500);
  }

  await logAudit(db, {
    clientId,
    actorId: authResult.user.id,
    action: 'reset_failed_tasks',
    entityType: 'task_queue',
    entityId: clientId,
    oldValue: null,
    newValue: { count: data?.length || 0 },
    ...meta
  });

  return json({ message: `Reset ${data?.length || 0} failed tasks`, count: data?.length || 0 });
}

// ============================================================================
// AUDIT LOG ENDPOINTS
// ============================================================================

/**
 * GET /api/admin/audit-log - List audit log entries
 * Query params:
 *   - client_id: Filter by client
 *   - action: Filter by action type (create, update, delete)
 *   - entity_type: Filter by entity type
 *   - days: Filter to last N days
 *   - limit: Number of entries (default 50, max 200)
 *   - offset: Pagination offset
 */
export async function listAuditLog(request) {
  const authResult = await requireAdmin(request);
  if (authResult instanceof Response) return authResult;

  const db = getAdminClient();
  const url = new URL(request.url);

  // Parse query params
  const clientId = url.searchParams.get('client_id') || null;
  const actionFilter = url.searchParams.get('action') || null;
  const entityType = url.searchParams.get('entity_type') || null;
  const days = url.searchParams.get('days') ? parseInt(url.searchParams.get('days')) : null;
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0');

  // Build query
  let query = db
    .from('admin_audit_log')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  // Apply filters
  if (clientId) {
    query = query.eq('client_id', clientId);
  }

  if (actionFilter) {
    // Match action patterns like 'create_%', 'update_%', 'delete_%'
    query = query.ilike('action', `${actionFilter}%`);
  }

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }

  if (days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    query = query.gte('created_at', cutoffDate.toISOString());
  }

  const { data, count, error: dbError } = await query;

  if (dbError) {
    console.error('List audit log error:', dbError);
    return error('Failed to list audit log', 500);
  }

  // Get actor emails for display
  const actorIds = [...new Set(data?.map(d => d.actor_id).filter(Boolean))];
  let actorMap = {};

  if (actorIds.length > 0) {
    const { data: users } = await db
      .from('portal_users')
      .select('user_id, email')
      .in('user_id', actorIds);

    if (users) {
      actorMap = Object.fromEntries(users.map(u => [u.user_id, u.email]));
    }
  }

  // Enhance entries with actor email
  const entries = (data || []).map(entry => ({
    ...entry,
    actor_email: actorMap[entry.actor_id] || 'Unknown'
  }));

  return json({
    entries,
    total: count || 0,
    limit,
    offset,
    hasMore: (offset + limit) < (count || 0)
  });
}
