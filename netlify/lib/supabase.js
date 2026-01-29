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
  console.log('[verifyToken] Starting token verification...');
  
  if (!token) {
    console.log('[verifyToken] No token provided');
    return null;
  }
  
  const supabase = getAuthClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  console.log('[verifyToken] Supabase auth.getUser result:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    error: error?.message 
  });
  
  if (error || !user) {
    console.log('[verifyToken] Auth failed:', error?.message || 'No user returned');
    return null;
  }
  
  // Get client_id from user metadata or portal_users table
  const adminClient = getAdminClient();
  
  // First, check if portal_users table exists
  console.log('[verifyToken] Querying portal_users for email:', user.email);
  
  const { data: portalUser, error: portalError } = await adminClient
    .from('portal_users')
    .select('client_id, role')
    .eq('email', user.email)
    .single();
  
  console.log('[verifyToken] portal_users query result:', {
    portalUser,
    error: portalError?.message,
    errorCode: portalError?.code,
    errorDetails: portalError?.details
  });
  
  // If portal_users doesn't have this user, try to find client by email directly
  if (!portalUser && user.email) {
    console.log('[verifyToken] No portal_user found, checking clients table...');
    const { data: client, error: clientError } = await adminClient
      .from('clients')
      .select('client_id, name, email')
      .eq('email', user.email)
      .single();
    
    console.log('[verifyToken] clients table query result:', {
      client,
      error: clientError?.message
    });
    
    if (client) {
      console.log('[verifyToken] Found client directly, creating portal_user...');
      // Auto-create portal user
      const { data: newPortalUser, error: insertError } = await adminClient
        .from('portal_users')
        .insert({
          email: user.email,
          client_id: client.client_id,
          role: 'client',
          is_active: true
        })
        .select('client_id, role')
        .single();
      
      console.log('[verifyToken] Auto-created portal_user:', { newPortalUser, insertError: insertError?.message });
      
      return {
        user,
        client_id: newPortalUser?.client_id || client.client_id,
        role: newPortalUser?.role || 'client'
      };
    }
  }
  
  const result = {
    user,
    client_id: portalUser?.client_id || null,
    role: portalUser?.role || 'client'
  };
  
  console.log('[verifyToken] Final result:', { 
    email: user.email,
    client_id: result.client_id, 
    role: result.role 
  });
  
  return result;
}
