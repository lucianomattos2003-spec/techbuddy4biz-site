/**
 * Fix onboarding database functions for OTP authentication
 *
 * This script:
 * 1. Adds 'onboarding' to client_status enum if not exists
 * 2. Drops old magic link functions
 * 3. Creates start_onboarding function with OTP and client_key generation
 * 4. Fixes ambiguous column references
 */

-- Step 1: Add 'onboarding' to client_status enum if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'onboarding'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'client_status')
    ) THEN
        ALTER TYPE client_status ADD VALUE 'onboarding';
    END IF;
END $$;

-- Step 2: Drop old magic link functions if they exist
DROP FUNCTION IF EXISTS request_magic_link(TEXT);
DROP FUNCTION IF EXISTS verify_magic_link(TEXT);

-- Step 3: Create or replace start_onboarding function with OTP authentication
CREATE OR REPLACE FUNCTION start_onboarding(
  p_business_name TEXT,
  p_contact_email TEXT,
  p_contact_first_name TEXT DEFAULT NULL,
  p_contact_last_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_timezone TEXT DEFAULT 'America/New_York',
  p_source TEXT DEFAULT 'self_signup'
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  session_id UUID,
  client_id UUID,
  portal_user_id UUID,
  otp_code TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
  v_portal_user_id UUID;
  v_session_id UUID;
  v_otp_code TEXT;
  v_client_key TEXT;
  v_max_key_number INT;
BEGIN
  -- Generate 6-digit OTP code
  v_otp_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');

  -- Generate unique client_key (e.g., CLIENT-001, CLIENT-002, etc.)
  SELECT COALESCE(MAX(CAST(SUBSTRING(client_key FROM 8) AS INTEGER)), 0) + 1
  INTO v_max_key_number
  FROM clients
  WHERE client_key ~ '^CLIENT-[0-9]+$';

  v_client_key := 'CLIENT-' || LPAD(v_max_key_number::TEXT, 3, '0');

  -- Create client record with onboarding status
  INSERT INTO clients (
    client_key,
    name,
    status,
    timezone,
    source,
    created_at,
    updated_at
  )
  VALUES (
    v_client_key,
    p_business_name,
    'onboarding',
    p_timezone,
    p_source,
    NOW(),
    NOW()
  )
  RETURNING clients.client_id INTO v_client_id;

  -- Create portal user with OTP
  INSERT INTO portal_users (
    email,
    client_id,
    role,
    first_name,
    last_name,
    otp_code,
    otp_expires_at,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    p_contact_email,
    v_client_id,
    'client',
    p_contact_first_name,
    p_contact_last_name,
    v_otp_code,
    NOW() + INTERVAL '24 hours',
    true,
    NOW(),
    NOW()
  )
  RETURNING portal_users.user_id INTO v_portal_user_id;

  -- Create onboarding session
  INSERT INTO onboarding_sessions (
    client_id,
    portal_user_id,
    status,
    current_step,
    total_steps,
    data,
    started_at,
    created_by,
    source
  )
  VALUES (
    v_client_id,
    v_portal_user_id,
    'in_progress',
    1,
    6,
    jsonb_build_object(
      'step1', jsonb_build_object(
        'business_name', p_business_name,
        'contact_email', p_contact_email,
        'contact_first_name', p_contact_first_name,
        'contact_last_name', p_contact_last_name,
        'phone', p_phone,
        'timezone', p_timezone
      )
    ),
    NOW(),
    v_portal_user_id,
    p_source
  )
  RETURNING onboarding_sessions.session_id INTO v_session_id;

  -- Return success with all IDs and OTP code
  RETURN QUERY SELECT
    true as success,
    'Onboarding session created successfully' as message,
    v_session_id as session_id,
    v_client_id as client_id,
    v_portal_user_id as portal_user_id,
    v_otp_code as otp_code;

EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT
    false as success,
    SQLERRM as message,
    NULL::UUID as session_id,
    NULL::UUID as client_id,
    NULL::UUID as portal_user_id,
    NULL::TEXT as otp_code;
END;
$$;

-- Step 4: Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION start_onboarding(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION start_onboarding(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;

-- Done!
SELECT 'Onboarding OTP authentication functions updated successfully!' as status;
