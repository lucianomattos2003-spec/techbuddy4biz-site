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
import { cors, notFound, serverError } from '../lib/response.js';

export default async function handler(request, context) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return cors();
  }

  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/api/, '').replace(/\/$/, '') || '/';
    const method = request.method;

    // Route matching
    // Auth routes
    if (path === '/auth/magic-link' && method === 'POST') {
      return auth.requestMagicLink(request);
    }
    if (path === '/auth/me' && method === 'GET') {
      return auth.getMe(request);
    }

    // Posts routes
    if (path === '/posts' && method === 'GET') {
      return posts.listPosts(request);
    }
    if (path === '/posts' && method === 'POST') {
      return posts.createPost(request);
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
