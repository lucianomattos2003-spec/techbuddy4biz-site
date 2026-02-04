/**
 * Onboarding Routes
 *
 * POST /api/onboarding/start          - Start new onboarding session (public)
 * GET  /api/onboarding/:session_id    - Get session details
 * POST /api/onboarding/:session_id/progress - Save step progress
 * POST /api/onboarding/:session_id/complete - Complete onboarding (trigger n8n)
 */

import { getAdminClient } from '../../lib/supabase.js';
import { json, created, error, parseBody } from '../../lib/response.js';

/**
 * Start new onboarding session
 * Public endpoint - no auth required
 *
 * Body: {
 *   business_name: string (required),
 *   contact_email: string (required),
 *   contact_first_name: string (optional),
 *   contact_last_name: string (optional),
 *   phone: string (optional),
 *   timezone: string (optional, default: America/New_York)
 * }
 */
export async function startOnboarding(request) {
  console.log('[ONBOARDING] Start onboarding request received');
  const body = await parseBody(request);
  console.log('[ONBOARDING] Request body:', {
    business_name: body?.business_name,
    contact_email: body?.contact_email,
    has_phone: !!body?.phone
  });

  if (!body?.business_name) return error('business_name is required', 400);
  if (!body?.contact_email) return error('contact_email is required', 400);

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.contact_email)) {
    return error('Invalid email format', 400);
  }

  const db = getAdminClient();

  try {
    console.log('[ONBOARDING] Calling start_onboarding DB function');
    // Call start_onboarding DB function
    const { data, error: dbError } = await db.rpc('start_onboarding', {
      p_business_name: body.business_name,
      p_contact_email: body.contact_email,
      p_contact_first_name: body.contact_first_name || null,
      p_contact_last_name: body.contact_last_name || null,
      p_phone: body.phone || null,
      p_timezone: body.timezone || 'America/New_York',
      p_source: 'self_signup'
    });

    if (dbError) {
      console.error('[ONBOARDING] Start onboarding DB error:', dbError);
      console.error('[ONBOARDING] Error details:', JSON.stringify(dbError, null, 2));
      return error('Failed to start onboarding', 500);
    }

    if (!data || data.length === 0 || !data[0].success) {
      console.error('[ONBOARDING] DB function returned unsuccessful result:', data);
      return error('Failed to create onboarding session', 500);
    }

    const result = data[0];
    console.log('[ONBOARDING] Session created successfully:', {
      session_id: result.session_id,
      client_id: result.client_id,
      portal_user_id: result.portal_user_id
    });

    // Note: otp_code is returned for DEV purposes only
    // In production, this should be sent via email and NOT returned in API response
    return created({
      session_id: result.session_id,
      client_id: result.client_id,
      portal_user_id: result.portal_user_id,
      otp_code: result.otp_code, // DEV ONLY - remove in production
      message: 'Onboarding session created. Check email for verification code.'
    });
  } catch (err) {
    console.error('[ONBOARDING] Start onboarding exception:', err);
    console.error('[ONBOARDING] Exception stack:', err.stack);
    return error('Internal server error', 500);
  }
}

/**
 * Get onboarding session details
 * Requires session_id in URL
 * Public during onboarding (no auth required until password is set)
 */
export async function getSession(request, sessionId) {
  if (!sessionId) return error('session_id is required', 400);

  const db = getAdminClient();

  try {
    const { data: session, error: dbError } = await db
      .from('onboarding_sessions')
      .select(`
        session_id,
        client_id,
        lead_id,
        portal_user_id,
        status,
        current_step,
        total_steps,
        data,
        started_at,
        completed_at,
        created_by,
        source_url,
        utm_source,
        utm_medium,
        utm_campaign
      `)
      .eq('session_id', sessionId)
      .single();

    if (dbError) {
      console.error('Get session error:', dbError);
      return error('Session not found', 404);
    }

    if (!session) {
      return error('Session not found', 404);
    }

    return json({ session });
  } catch (err) {
    console.error('Get session exception:', err);
    return error('Internal server error', 500);
  }
}

/**
 * Save onboarding progress for a specific step
 * Public during onboarding (no auth required until password is set)
 *
 * Body: {
 *   step: number (required, 1-6),
 *   data: object (required, step-specific data)
 * }
 */
export async function saveProgress(request, sessionId) {
  if (!sessionId) return error('session_id is required', 400);

  const body = await parseBody(request);

  if (!body?.step) return error('step is required', 400);
  if (!body?.data) return error('data is required', 400);

  const step = parseInt(body.step);
  if (isNaN(step) || step < 1 || step > 6) {
    return error('step must be between 1 and 6', 400);
  }

  const db = getAdminClient();

  try {
    // Verify session exists and is in_progress
    const { data: session, error: sessionError } = await db
      .from('onboarding_sessions')
      .select('session_id, status')
      .eq('session_id', sessionId)
      .single();

    if (sessionError || !session) {
      return error('Session not found', 404);
    }

    if (session.status !== 'in_progress') {
      return error('Session is not in progress', 400);
    }

    // Call save_onboarding_progress DB function
    const { data, error: dbError } = await db.rpc('save_onboarding_progress', {
      p_session_id: sessionId,
      p_step_number: step,
      p_step_data: body.data
    });

    if (dbError) {
      console.error('Save progress error:', dbError);
      return error('Failed to save progress', 500);
    }

    if (!data || data.length === 0 || !data[0].success) {
      return error('Failed to save progress', 500);
    }

    return json({
      success: true,
      message: `Step ${step} saved successfully`
    });
  } catch (err) {
    console.error('Save progress exception:', err);
    return error('Internal server error', 500);
  }
}

/**
 * Complete onboarding - marks session complete, activates client, triggers n8n setup
 * Public during onboarding (no auth required until password is set)
 */
export async function completeOnboarding(request, sessionId) {
  if (!sessionId) return error('session_id is required', 400);

  const db = getAdminClient();

  try {
    // Verify session exists and is in_progress
    const { data: session, error: sessionError } = await db
      .from('onboarding_sessions')
      .select('session_id, status, current_step, client_id, portal_user_id, data')
      .eq('session_id', sessionId)
      .single();

    if (sessionError || !session) {
      return error('Session not found', 404);
    }

    if (session.status !== 'in_progress') {
      return error('Session is not in progress', 400);
    }

    // Verify all required steps are completed (at least step 5)
    if (session.current_step < 5) {
      return error('Please complete all required steps before finishing', 400);
    }

    // Call complete_onboarding DB function
    const { data, error: dbError } = await db.rpc('complete_onboarding', {
      p_session_id: sessionId
    });

    if (dbError) {
      console.error('Complete onboarding error:', dbError);
      return error('Failed to complete onboarding', 500);
    }

    if (!data || data.length === 0 || !data[0].success) {
      return error('Failed to complete onboarding', 500);
    }

    // Call n8n webhook to trigger full client setup
    let setupTriggered = false;
    const n8nWebhookUrl = process.env.N8N_COMPLETE_ONBOARDING_WEBHOOK
      || 'https://techbuddy4biz.app.n8n.cloud/webhook/complete-onboarding';

    try {
      console.log('[ONBOARDING] Calling n8n webhook:', n8nWebhookUrl);
      const webhookResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          client_id: session.client_id,
          portal_user_id: session.portal_user_id,
          onboarding_data: session.data
        })
      });

      const webhookResult = await webhookResponse.json();
      console.log('[ONBOARDING] n8n webhook response:', webhookResult);

      if (webhookResult.success) {
        setupTriggered = true;
      } else {
        console.error('[ONBOARDING] n8n webhook failed:', webhookResult);
      }
    } catch (webhookErr) {
      console.error('[ONBOARDING] n8n webhook exception:', webhookErr);
      // Don't fail the request - onboarding is complete, setup can be retried
    }

    return json({
      success: true,
      message: 'Onboarding completed! Check your email to set your password and access the dashboard.',
      status: 'completed',
      client_id: session.client_id,
      setup_triggered: setupTriggered
    });
  } catch (err) {
    console.error('Complete onboarding exception:', err);
    return error('Internal server error', 500);
  }
}
