/**
 * Authentication Routes
 * 
 * POST /api/auth/magic-link - Request magic link email
 * GET  /api/auth/me         - Get current user info
 */

import { getAuthClient, getAdminClient } from '../../lib/supabase.js';
import { requireAuth, extractToken } from '../../lib/auth.js';
import { json, error, parseBody } from '../../lib/response.js';

/**
 * Request a magic link email for passwordless login
 * Body: { email: string }
 */
export async function requestMagicLink(request) {
  const body = await parseBody(request);
  
  if (!body?.email) {
    return error('Email is required', 400);
  }

  const email = body.email.toLowerCase().trim();
  
  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return error('Invalid email format', 400);
  }

  // Check if user exists in portal_users
  const adminClient = getAdminClient();
  const { data: portalUser } = await adminClient
    .from('portal_users')
    .select('user_id, client_id, is_active')
    .eq('email', email)
    .single();

  if (!portalUser) {
    // For security, don't reveal if email exists
    // But in dev, we might want to auto-create - check client by email
    const { data: client } = await adminClient
      .from('clients')
      .select('client_id, name')
      .eq('email', email)
      .single();

    if (client) {
      // Auto-create portal user for existing client
      await adminClient.from('portal_users').insert({
        email,
        client_id: client.client_id,
        role: 'client',
        is_active: true
      });
    }
  } else if (!portalUser.is_active) {
    return error('Account is disabled. Please contact support.', 403);
  }

  // Send magic link via Supabase Auth
  const supabase = getAuthClient();
  const redirectUrl = process.env.APP_URL 
    ? `${process.env.APP_URL}/portal/auth/callback`
    : 'http://localhost:8888/portal/auth/callback';

  const { error: authError } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl
    }
  });

  if (authError) {
    console.error('Magic link error:', authError);
    return error('Failed to send magic link. Please try again.', 500);
  }

  return json({ 
    success: true, 
    message: 'Check your email for the login link' 
  });
}

/**
 * Get current authenticated user info
 * Requires: Authorization header with Bearer token
 */
export async function getMe(request) {
  const authResult = await requireAuth(request);
  
  // If it's a Response (error), return it
  if (authResult instanceof Response) return authResult;

  const { user, client_id, role } = authResult;

  // Get additional client info
  const adminClient = getAdminClient();
  const { data: client } = await adminClient
    .from('clients')
    .select('name, timezone, email')
    .eq('client_id', client_id)
    .single();

  return json({
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at
    },
    client: client ? {
      client_id,
      name: client.name,
      timezone: client.timezone,
      email: client.email
    } : null,
    role
  });
}
