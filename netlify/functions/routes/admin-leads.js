/**
 * Admin Lead Management Routes
 *
 * POST /api/admin/leads/:lead_id/convert - Convert lead to client with onboarding
 */

import { getAdminClient } from '../../lib/supabase.js';
import { requireAuth } from '../../lib/auth.js';
import { json, created, error, parseBody } from '../../lib/response.js';

/**
 * Convert a lead to a client and create onboarding session
 * Admin only
 *
 * Body: {
 *   converted_by: string (optional, defaults to admin user email)
 * }
 */
export async function convertLeadToClient(request, leadId) {
  // Require authentication
  const authResult = await requireAuth(request);
  if (authResult instanceof Response) return authResult;

  const { user } = authResult;

  // TODO: Add admin role check when role system is implemented
  // For now, any authenticated user can convert leads

  if (!leadId) return error('lead_id is required', 400);

  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(leadId)) {
    return error('Invalid lead_id format', 400);
  }

  const body = await parseBody(request);
  const convertedBy = body?.converted_by || user?.email || 'admin';

  const db = getAdminClient();

  try {
    // Call convert_lead_to_client DB function
    const { data, error: dbError } = await db.rpc('convert_lead_to_client', {
      p_lead_id: leadId,
      p_converted_by: convertedBy
    });

    if (dbError) {
      console.error('Convert lead error:', dbError);
      return error('Failed to convert lead', 500);
    }

    if (!data || data.length === 0) {
      return error('Failed to convert lead', 500);
    }

    const result = data[0];

    if (!result.success) {
      return error(result.message || 'Failed to convert lead', 400);
    }

    return created({
      success: true,
      message: result.message,
      client_id: result.client_id,
      portal_user_id: result.portal_user_id,
      session_id: result.session_id,
      onboarding_url: result.onboarding_url
    });
  } catch (err) {
    console.error('Convert lead exception:', err);
    return error('Internal server error', 500);
  }
}
