/**
 * Authentication middleware for Netlify Functions
 * Extracts JWT from Authorization header and verifies with Supabase
 */

import { verifyToken } from './supabase.js';

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
  
  const authResult = await verifyToken(token);
  
  if (!authResult) {
    return new Response(JSON.stringify({ error: 'Invalid or expired token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  if (!authResult.client_id) {
    return new Response(JSON.stringify({ error: 'User not linked to a client account' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  return authResult;
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
