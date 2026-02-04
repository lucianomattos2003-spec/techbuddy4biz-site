/**
 * Main API Router for TechBuddy4Biz Portal
 * Handles all /api/* routes via Netlify Functions
 *
 * Routes:
 *   POST /api/auth/login          - Login with email/password
 *   GET  /api/auth/me             - Get current user info
 *   GET  /api/posts               - List posts (with filters)
 *   POST /api/posts               - Create single post
 *   GET  /api/posts/:id           - Get post details
 *   PUT  /api/posts/:id           - Update post
 *   DELETE /api/posts/:id         - Delete post
 *   POST /api/batches             - Create batch of posts
 *   GET  /api/batches/:id         - Get batch status
 *   GET  /api/media               - List client media library
 *   GET  /api/media/:id           - Get single media asset
 *   POST /api/media               - Save media record after upload
 *   PUT  /api/media/:id           - Update media asset
 *   DELETE /api/media/:id         - Delete media asset
 *   POST /api/media/sign          - Get signed Cloudinary upload params
 *   GET  /api/schedule            - Get client schedule config
 */

import * as auth from './routes/auth.js';
import * as posts from './routes/posts.js';
import * as batches from './routes/batches.js';
import * as media from './routes/media.js';
import * as schedule from './routes/schedule.js';
import * as onboarding from './routes/onboarding.js';
import * as adminLeads from './routes/admin-leads.js';
import * as adminConfig from './routes/admin-config.js';
import * as portalConfig from './routes/portal-config.js';
import * as approvals from './routes/approvals.js';
import { cors, notFound, serverError, json } from '../lib/response.js';
import { getAdminClient, getAuthClient } from '../lib/supabase.js';
import { extractToken } from '../lib/auth.js';

export default async function handler(request, context) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return cors();
  }

  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '').replace(/\/index\.html?$/, '').replace(/\/$/, '') || '/';
    const method = request.method;

    console.log(`[API] ${method} ${path} - Started`);
    console.log(`[API] Full URL:`, url.href);
    console.log(`[API] Headers:`, Object.fromEntries(request.headers.entries()));

    // Debug endpoint - NO AUTH REQUIRED
    if (path === '/debug' && method === 'GET') {
      const adminClient = getAdminClient();
      const authClient = getAuthClient();
      
      const results = {
        timestamp: new Date().toISOString(),
        env: {
          SUPABASE_URL: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
          SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ? 'SET (length: ' + process.env.SUPABASE_ANON_KEY.length + ')' : 'MISSING',
          SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY ? 'SET (length: ' + process.env.SUPABASE_SERVICE_KEY.length + ')' : 'MISSING',
        },
        tables: {},
        auth: {}
      };
      
      // Check if portal_users table exists
      try {
        const { data: portalUsers, error: portalError } = await adminClient
          .from('portal_users')
          .select('*')
          .limit(5);
        results.tables.portal_users = {
          exists: !portalError || portalError.code !== 'PGRST204',
          count: portalUsers?.length || 0,
          error: portalError?.message,
          errorCode: portalError?.code,
          data: portalUsers
        };
      } catch (e) {
        results.tables.portal_users = { error: e.message };
      }
      
      // Check if clients table exists and has email column
      try {
        const { data: clients, error: clientsError } = await adminClient
          .from('clients')
          .select('client_id, name, email')
          .limit(5);
        results.tables.clients = {
          exists: !clientsError || clientsError.code !== 'PGRST204',
          count: clients?.length || 0,
          error: clientsError?.message,
          errorCode: clientsError?.code,
          data: clients
        };
      } catch (e) {
        results.tables.clients = { error: e.message };
      }
      
      // Check token if provided
      const token = extractToken(request);
      if (token) {
        try {
          const { data: { user }, error: authError } = await authClient.auth.getUser(token);
          results.auth = {
            hasToken: true,
            tokenValid: !!user,
            userEmail: user?.email,
            userId: user?.id,
            error: authError?.message
          };
          
          // If user found, check if they exist in portal_users
          if (user?.email) {
            const { data: portalUser, error: puError } = await adminClient
              .from('portal_users')
              .select('*')
              .eq('email', user.email)
              .single();
            results.auth.portalUser = {
              found: !!portalUser,
              data: portalUser,
              error: puError?.message
            };
          }
        } catch (e) {
          results.auth = { hasToken: true, error: e.message };
        }
      } else {
        results.auth = { hasToken: false };
      }
      
      return json(results);
    }
    
    // Debug endpoint to link user to client (DEV ONLY)
    if (path === '/debug/link-user' && method === 'POST') {
      const adminClient = getAdminClient();
      const body = await request.json();
      const { email, client_id, role } = body;
      
      if (!email) {
        return json({ error: 'Email is required' }, 400);
      }
      
      const updateData = {};
      // Explicitly handle null for client_id
      if (body.hasOwnProperty('client_id')) updateData.client_id = client_id;
      if (role) updateData.role = role;
      
      const { data, error } = await adminClient
        .from('portal_users')
        .update(updateData)
        .eq('email', email)
        .select()
        .single();
        
      if (error) {
        return json({ error: error.message }, 400);
      }
      
      return json({ success: true, user: data });
    }
    
    // Debug endpoint to update client email (DEV ONLY)
    if (path === '/debug/update-client' && method === 'POST') {
      const adminClient = getAdminClient();
      const body = await request.json();
      const { client_id, email, name } = body;
      
      if (!client_id) {
        return json({ error: 'client_id is required' }, 400);
      }
      
      const updateData = {};
      if (email) updateData.email = email;
      if (name) updateData.name = name;
      
      const { data, error } = await adminClient
        .from('clients')
        .update(updateData)
        .eq('client_id', client_id)
        .select()
        .single();
        
      if (error) {
        return json({ error: error.message }, 400);
      }
      
      return json({ success: true, client: data });
    }
    
    // Debug endpoint to update portal user (DEV ONLY)
    if (path === '/debug/update-user' && method === 'POST') {
      const adminClient = getAdminClient();
      const body = await request.json();
      const { user_id, email, new_email, password } = body;
      
      if (!user_id && !email) {
        return json({ error: 'user_id or email is required' }, 400);
      }
      
      const updateData = {};
      if (new_email) updateData.email = new_email;
      
      // Hash password if provided
      if (password) {
        const { hashPassword } = await import('../lib/password.js');
        updateData.password_hash = await hashPassword(password);
      }
      
      let query = adminClient.from('portal_users').update(updateData);
      if (user_id) {
        query = query.eq('user_id', user_id);
      } else {
        query = query.eq('email', email);
      }
      
      const { data, error } = await query.select().single();
        
      if (error) {
        return json({ error: error.message }, 400);
      }
      
      return json({ success: true, user: data });
    }
    
    // Debug endpoint to delete portal user (DEV ONLY)
    if (path === '/debug/delete-user' && method === 'POST') {
      const adminClient = getAdminClient();
      const body = await request.json();
      const { user_id, email } = body;
      
      if (!user_id && !email) {
        return json({ error: 'user_id or email is required' }, 400);
      }
      
      let query = adminClient.from('portal_users').delete();
      if (user_id) {
        query = query.eq('user_id', user_id);
      } else {
        query = query.eq('email', email);
      }
      
      const { error } = await query;
        
      if (error) {
        return json({ error: error.message }, 400);
      }
      
      return json({ success: true, deleted: email || user_id });
    }

    // Route matching
    // Auth routes (App-Level Authentication)
    if (path === '/auth/login' && method === 'POST') {
      console.log('[API] Routing to auth.login');
      return auth.login(request);
    }
    if (path === '/auth/register' && method === 'POST') {
      return auth.register(request);
    }
    if (path === '/auth/me' && method === 'GET') {
      console.log('[API] Routing to auth.getMe');
      return auth.getMe(request);
    }
    if (path === '/auth/refresh' && method === 'POST') {
      return auth.refresh(request);
    }
    if (path === '/auth/logout' && method === 'POST') {
      return auth.logout(request);
    }
    if (path === '/auth/request-reset' && method === 'POST') {
      return auth.requestReset(request);
    }
    if (path === '/auth/verify-otp' && method === 'POST') {
      return auth.verifyOTPCode(request);
    }
    if (path === '/auth/reset-password' && method === 'POST') {
      return auth.resetPassword(request);
    }
    if (path === '/auth/set-password' && method === 'POST') {
      return auth.setPassword(request);
    }

    // Posts routes
    if (path === '/posts' && method === 'GET') {
      return posts.listPosts(request);
    }
    if (path === '/posts' && method === 'POST') {
      return posts.createPost(request);
    }
    if (path === '/posts/bulk' && method === 'POST') {
      return posts.bulkAction(request);
    }
    if (path.match(/^\/posts\/[\w-]+\/approve$/) && method === 'POST') {
      const postId = path.split('/')[2];
      return posts.approvePost(request, postId);
    }
    if (path.match(/^\/posts\/[\w-]+\/reject$/) && method === 'POST') {
      const postId = path.split('/')[2];
      return posts.rejectPost(request, postId);
    }
    if (path.match(/^\/posts\/[\w-]+$/) && method === 'GET') {
      const postId = path.split('/')[2];
      return posts.getPost(request, postId);
    }
    if (path.match(/^\/posts\/[\w-]+$/) && method === 'PUT') {
      const postId = path.split('/')[2];
      return posts.updatePost(request, postId);
    }
    if (path.match(/^\/posts\/[\w-]+$/) && method === 'DELETE') {
      const postId = path.split('/')[2];
      return posts.deletePost(request, postId);
    }

    // Batches routes
    if (path === '/batches' && method === 'POST') {
      return batches.createBatch(request);
    }
    if (path.match(/^\/batches\/[\w-]+$/) && method === 'GET') {
      const batchId = path.split('/')[2];
      return batches.getBatch(request, batchId);
    }

    // Media routes
    if (path === '/media' && method === 'GET') {
      return media.listMedia(request);
    }
    if (path === '/media/sign' && method === 'POST') {
      return media.getSignedUploadParams(request);
    }
    if (path === '/media' && method === 'POST') {
      return media.saveMediaRecord(request);
    }
    if (path.match(/^\/media\/[\w-]+$/) && method === 'GET') {
      const assetId = path.split('/')[2];
      return media.getMedia(request, assetId);
    }
    if (path.match(/^\/media\/[\w-]+$/) && method === 'PUT') {
      const assetId = path.split('/')[2];
      return media.updateMedia(request, assetId);
    }
    if (path.match(/^\/media\/[\w-]+$/) && method === 'DELETE') {
      const assetId = path.split('/')[2];
      return media.deleteMedia(request, assetId);
    }

    // Schedule routes
    if (path === '/schedule' && method === 'GET') {
      return schedule.getSchedule(request);
    }
    if (path === '/schedule/platforms' && method === 'GET') {
      return schedule.getEnabledPlatforms(request);
    }
    if (path === '/schedule' && method === 'PUT') {
      return schedule.updateSchedule(request);
    }

    // Unified Approval Center routes
    if (path === '/portal/approvals' && method === 'GET') {
      return approvals.listApprovals(request);
    }
    if (path === '/portal/approvals/bulk/approve' && method === 'POST') {
      return approvals.bulkApprove(request);
    }
    if (path === '/portal/approvals/bulk/reject' && method === 'POST') {
      return approvals.bulkReject(request);
    }
    if (path.match(/^\/portal\/approvals\/(post|message)\/[\w-]+\/approve$/) && method === 'POST') {
      const parts = path.split('/');
      const type = parts[3]; // post or message
      const id = parts[4];
      return approvals.approveItem(request, type, id);
    }
    if (path.match(/^\/portal\/approvals\/(post|message)\/[\w-]+\/reject$/) && method === 'POST') {
      const parts = path.split('/');
      const type = parts[3]; // post or message
      const id = parts[4];
      return approvals.rejectItem(request, type, id);
    }

    // Portal Config routes (client-scoped, auto-scoped to authenticated user's client_id)
    if (path === '/portal/branding' && method === 'GET') {
      return portalConfig.getBranding(request);
    }
    if (path === '/portal/branding' && method === 'PUT') {
      return portalConfig.updateBranding(request);
    }
    if (path === '/portal/settings' && method === 'GET') {
      return portalConfig.getSettings(request);
    }
    if (path === '/portal/settings' && method === 'PUT') {
      return portalConfig.updateSettings(request);
    }
    if (path === '/portal/hashtags' && method === 'GET') {
      return portalConfig.listHashtags(request);
    }
    if (path === '/portal/hashtags' && method === 'POST') {
      return portalConfig.createHashtag(request);
    }
    if (path.match(/^\/portal\/hashtags\/[\w-]+$/) && method === 'PUT') {
      const packId = path.split('/')[3];
      return portalConfig.updateHashtag(request, packId);
    }
    if (path.match(/^\/portal\/hashtags\/[\w-]+$/) && method === 'DELETE') {
      const packId = path.split('/')[3];
      return portalConfig.deleteHashtag(request, packId);
    }
    if (path === '/portal/themes' && method === 'GET') {
      return portalConfig.listThemes(request);
    }
    if (path.match(/^\/portal\/themes\/[\w-]+$/) && method === 'PUT') {
      const themeId = path.split('/')[3];
      return portalConfig.updateTheme(request, themeId);
    }
    if (path === '/portal/themes/bulk' && method === 'PATCH') {
      return portalConfig.bulkUpdateThemes(request);
    }
    if (path === '/portal/schedules' && method === 'GET') {
      return portalConfig.listSchedules(request);
    }
    if (path.match(/^\/portal\/schedules\/[\w-]+$/) && method === 'PUT') {
      const scheduleId = path.split('/')[3];
      return portalConfig.updateSchedule(request, scheduleId);
    }

    // Onboarding routes (Public - no auth for start)
    if (path === '/onboarding/start' && method === 'POST') {
      console.log('[API] Routing to onboarding.startOnboarding');
      return onboarding.startOnboarding(request);
    }
    if (path.match(/^\/onboarding\/[\w-]+$/) && method === 'GET') {
      const sessionId = path.split('/')[2];
      return onboarding.getSession(request, sessionId);
    }
    if (path.match(/^\/onboarding\/[\w-]+\/progress$/) && method === 'POST') {
      const sessionId = path.split('/')[2];
      return onboarding.saveProgress(request, sessionId);
    }
    if (path.match(/^\/onboarding\/[\w-]+\/complete$/) && method === 'POST') {
      const sessionId = path.split('/')[2];
      return onboarding.completeOnboarding(request, sessionId);
    }

    // Admin routes
    if (path.match(/^\/admin\/leads\/[\w-]+\/convert$/) && method === 'POST') {
      const leadId = path.split('/')[3];
      return adminLeads.convertLeadToClient(request, leadId);
    }

    // Admin Config routes
    // Clients
    if (path === '/admin/clients' && method === 'GET') {
      return adminConfig.listClients(request);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+$/) && method === 'PUT') {
      const clientId = path.split('/')[3];
      return adminConfig.updateClient(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/overview$/) && method === 'GET') {
      const clientId = path.split('/')[3];
      return adminConfig.getClientOverview(request, clientId);
    }

    // Schedules
    if (path.match(/^\/admin\/clients\/[\w-]+\/schedules$/) && method === 'GET') {
      const clientId = path.split('/')[3];
      return adminConfig.listSchedules(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/schedules$/) && method === 'POST') {
      const clientId = path.split('/')[3];
      return adminConfig.createSchedule(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/schedules\/[\w-]+$/) && method === 'GET') {
      const [, , , clientId, , scheduleId] = path.split('/');
      return adminConfig.getSchedule(request, clientId, scheduleId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/schedules\/[\w-]+$/) && method === 'PUT') {
      const [, , , clientId, , scheduleId] = path.split('/');
      return adminConfig.updateSchedule(request, clientId, scheduleId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/schedules\/[\w-]+$/) && method === 'DELETE') {
      const [, , , clientId, , scheduleId] = path.split('/');
      return adminConfig.deleteSchedule(request, clientId, scheduleId);
    }

    // Themes
    if (path.match(/^\/admin\/clients\/[\w-]+\/themes$/) && method === 'GET') {
      const clientId = path.split('/')[3];
      return adminConfig.listThemes(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/themes$/) && method === 'POST') {
      const clientId = path.split('/')[3];
      return adminConfig.createTheme(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/themes\/bulk$/) && method === 'PATCH') {
      const clientId = path.split('/')[3];
      return adminConfig.bulkUpdateThemes(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/themes\/[\w-]+$/) && method === 'GET') {
      const [, , , clientId, , themeId] = path.split('/');
      return adminConfig.getTheme(request, clientId, themeId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/themes\/[\w-]+$/) && method === 'PUT') {
      const [, , , clientId, , themeId] = path.split('/');
      return adminConfig.updateTheme(request, clientId, themeId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/themes\/[\w-]+$/) && method === 'DELETE') {
      const [, , , clientId, , themeId] = path.split('/');
      return adminConfig.deleteTheme(request, clientId, themeId);
    }

    // Prompts
    if (path.match(/^\/admin\/clients\/[\w-]+\/prompts$/) && method === 'GET') {
      const clientId = path.split('/')[3];
      return adminConfig.listPrompts(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/prompts$/) && method === 'POST') {
      const clientId = path.split('/')[3];
      return adminConfig.createPrompt(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/prompts\/[\w-]+$/) && method === 'PUT') {
      const [, , , clientId, , promptId] = path.split('/');
      return adminConfig.updatePrompt(request, clientId, promptId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/prompts\/[\w-]+$/) && method === 'DELETE') {
      const [, , , clientId, , promptId] = path.split('/');
      return adminConfig.deletePrompt(request, clientId, promptId);
    }

    // Rules
    if (path.match(/^\/admin\/clients\/[\w-]+\/rules$/) && method === 'GET') {
      const clientId = path.split('/')[3];
      return adminConfig.getRules(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/rules$/) && method === 'PUT') {
      const clientId = path.split('/')[3];
      return adminConfig.updateRules(request, clientId);
    }

    // Branding
    if (path.match(/^\/admin\/clients\/[\w-]+\/branding$/) && method === 'GET') {
      const clientId = path.split('/')[3];
      return adminConfig.getBranding(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/branding$/) && method === 'PUT') {
      const clientId = path.split('/')[3];
      return adminConfig.updateBranding(request, clientId);
    }

    // Hashtags
    if (path.match(/^\/admin\/clients\/[\w-]+\/hashtags$/) && method === 'GET') {
      const clientId = path.split('/')[3];
      return adminConfig.listHashtags(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/hashtags$/) && method === 'POST') {
      const clientId = path.split('/')[3];
      return adminConfig.createHashtag(request, clientId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/hashtags\/[\w-]+$/) && method === 'PUT') {
      const [, , , clientId, , packId] = path.split('/');
      return adminConfig.updateHashtag(request, clientId, packId);
    }
    if (path.match(/^\/admin\/clients\/[\w-]+\/hashtags\/[\w-]+$/) && method === 'DELETE') {
      const [, , , clientId, , packId] = path.split('/');
      return adminConfig.deleteHashtag(request, clientId, packId);
    }

    // Quick Actions
    if (path.match(/^\/admin\/clients\/[\w-]+\/actions\/reset-failed-tasks$/) && method === 'POST') {
      const clientId = path.split('/')[3];
      return adminConfig.resetFailedTasks(request, clientId);
    }

    // Audit Log
    if (path === '/admin/audit-log' && method === 'GET') {
      return adminConfig.listAuditLog(request);
    }

    // System Config
    if (path === '/admin/system/config' && method === 'GET') {
      return adminConfig.getSystemConfig(request);
    }
    if (path.match(/^\/admin\/system\/config\/[\w-]+$/) && method === 'PUT') {
      const configKey = path.split('/')[4];
      return adminConfig.updateSystemConfig(request, configKey);
    }
    if (path.match(/^\/admin\/system\/config\/[\w-]+$/) && method === 'DELETE') {
      const configKey = path.split('/')[4];
      return adminConfig.deleteSystemConfig(request, configKey);
    }
    if (path === '/admin/system/platforms' && method === 'GET') {
      return adminConfig.getPlatformConfigs(request);
    }
    if (path.match(/^\/admin\/system\/platforms\/[\w-]+$/) && method === 'PUT') {
      const platform = path.split('/')[4];
      return adminConfig.updatePlatformConfig(request, platform);
    }

    // Public config endpoints (no auth required)
    if (path === '/config/cloudinary' && method === 'GET') {
      const adminClient = getAdminClient();
      const { data, error: dbError } = await adminClient
        .from('system_config')
        .select('config_value')
        .eq('config_key', 'cloudinary')
        .single();

      if (dbError || !data) {
        return json({ error: 'Cloudinary config not found' }, 404);
      }

      try {
        const config = JSON.parse(data.config_value);
        // Only return public fields needed for uploads
        return json({
          cloud_name: config.cloud_name,
          upload_preset: config.upload_preset
        });
      } catch {
        return json({ error: 'Invalid cloudinary config' }, 500);
      }
    }

    // Health check
    if (path === '/health' && method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    console.log(`[API] No route matched for ${method} ${path}`);
    return notFound(`Route not found: ${method} ${path}`);
  } catch (err) {
    console.error('[API] Unhandled error:', err);
    console.error('[API] Error stack:', err.stack);
    return serverError(err.message);
  }
}

export const config = {
  path: "/api/*"
};
