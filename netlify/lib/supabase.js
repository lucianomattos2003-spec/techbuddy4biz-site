/**
 * Supabase client factory for Netlify Functions
 * - Uses Service Key for server-side operations (full DB access)
 * - Uses Anon Key for client-side auth verification
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

/**
 * Admin client with full DB access (service role)
 * Use for: inserting tasks, querying across tables, server-side operations
 */
export function getAdminClient() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables');
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * Auth client for verifying user JWTs
 * Use for: validating user sessions, getting user info
 */
export function getAuthClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Verify a Supabase JWT and return user data
 * @param {string} token - JWT from Authorization header
 * @returns {Promise<{user: object, client_id: string}|null>}
 */
export async function verifyToken(token) {
  if (!token) return null;
  
  const supabase = getAuthClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) return null;
  
  // Get client_id from user metadata or portal_users table
  const adminClient = getAdminClient();
  const { data: portalUser } = await adminClient
    .from('portal_users')
    .select('client_id, role')
    .eq('email', user.email)
    .single();
  
  return {
    user,
    client_id: portalUser?.client_id || null,
    role: portalUser?.role || 'client'
  };
}
