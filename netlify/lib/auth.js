/**
 * Authentication middleware for Netlify Functions
 * Uses app-level JWT tokens (not Supabase Auth)
 */

import { verifyToken } from './jwt.js';

/**
 * Extract Bearer token from Authorization header
 * @param {Request} request
 * @returns {string|null}
 */
export function extractToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Middleware to require authentication
 * Returns user context or error response
 * @param {Request} request
 * @returns {Promise<{user: object, client_id: string, role: string}|Response>}
 */
export async function requireAuth(request) {
  const token = extractToken(request);
  
  if (!token) {
    return new Response(JSON.stringify({ error: 'Missing authorization token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Verify our app-level JWT
  const payload = verifyToken(token);
  
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Check token type
  if (payload.type !== 'access') {
    return new Response(JSON.stringify({ error: 'Invalid token type' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  const role = payload.role || 'client';
  
  // Admin users don't need client_id - they have full access
  // Regular client users must have a client_id
  if (role !== 'admin' && !payload.client_id) {
    return new Response(JSON.stringify({ error: 'User not linked to a client account' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Return user context from token
  return {
    user: {
      id: payload.user_id,
      email: payload.email
    },
    client_id: payload.client_id, // null for admins
    role: role,
    isAdmin: role === 'admin'
  };
}

/**
 * Middleware to require admin role
 * @param {Request} request
 * @returns {Promise<{user: object, client_id: string, role: string}|Response>}
 */
export async function requireAdmin(request) {
  const authResult = await requireAuth(request);
  
  // If it's already a Response (error), return it
  if (authResult instanceof Response) return authResult;
  
  if (authResult.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Admin access required' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return authResult;
}
