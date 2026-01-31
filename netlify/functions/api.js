/**
 * Main API Router for TechBuddy4Biz Portal
 * Handles all /api/* routes via Netlify Functions
 * 
 * Routes:
 *   POST /api/auth/magic-link     - Request magic link email
 *   GET  /api/auth/me             - Get current user info
 *   GET  /api/posts               - List posts (with filters)
 *   POST /api/posts               - Create single post
 *   GET  /api/posts/:id           - Get post details
 *   PUT  /api/posts/:id           - Update post
 *   DELETE /api/posts/:id         - Delete post
 *   POST /api/batches             - Create batch of posts
 *   GET  /api/batches/:id         - Get batch status
 *   POST /api/media/sign          - Get signed Cloudinary upload params
 *   GET  /api/media               - List client media library
 *   GET  /api/schedule            - Get client schedule config
 */

import * as auth from './routes/auth.js';
import * as posts from './routes/posts.js';
import * as batches from './routes/batches.js';
import * as media from './routes/media.js';
import * as schedule from './routes/schedule.js';
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
    const path = url.pathname.replace(/^\/api/, '').replace(/\/$/, '') || '/';
    const method = request.method;

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
      return auth.login(request);
    }
    if (path === '/auth/register' && method === 'POST') {
      return auth.register(request);
    }
    if (path === '/auth/me' && method === 'GET') {
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

    // Health check
    if (path === '/health' && method === 'GET') {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return notFound(`Route not found: ${method} ${path}`);
  } catch (err) {
    console.error('API Error:', err);
    return serverError(err.message);
  }
}

export const config = {
  path: "/api/*"
};
