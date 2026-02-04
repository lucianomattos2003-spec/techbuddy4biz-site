/**
 * App-Level Authentication Routes
 * 
 * POST /api/auth/login          - Login with email/password
 * POST /api/auth/register       - Register new user (admin only or open)
 * GET  /api/auth/me             - Get current user info
 * POST /api/auth/refresh        - Refresh access token
 * POST /api/auth/logout         - Logout (invalidate session)
 * POST /api/auth/request-reset  - Request password reset OTP
 * POST /api/auth/verify-otp     - Verify OTP code
 * POST /api/auth/reset-password - Reset password with verified token
 */

import { getAdminClient } from '../../lib/supabase.js';
import { json, error, parseBody } from '../../lib/response.js';
import { hashPassword, verifyPassword, generateOTP, hashOTP, generateSecureToken } from '../../lib/password.js';
import { generateAccessToken, generateRefreshToken, verifyToken, getTokenExpiry } from '../../lib/jwt.js';

/**
 * Extract Bearer token from request
 */
function extractToken(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}

/**
 * Login with email and password
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */
export async function login(request) {
  console.log('[AUTH] Login attempt started');
  const body = await parseBody(request);

  if (!body?.email || !body?.password) {
    console.log('[AUTH] Login failed: missing email or password');
    return error('Email and password are required', 400);
  }

  const email = body.email.toLowerCase().trim();
  const password = body.password;
  console.log('[AUTH] Login attempt for email:', email);

  const db = getAdminClient();

  // Get user from portal_users
  const { data: user, error: userError } = await db
    .from('portal_users')
    .select('user_id, email, password_hash, client_id, role, is_active, locked_until, login_attempts')
    .eq('email', email)
    .single();

  if (userError || !user) {
    console.log('[AUTH] Login failed: user not found or DB error:', userError?.message);
    // Don't reveal if user exists
    return error('Invalid email or password', 401);
  }

  console.log('[AUTH] User found:', { user_id: user.user_id, email: user.email, role: user.role, is_active: user.is_active });

  // Check if account is locked
  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    console.log('[AUTH] Login failed: account locked until', user.locked_until);
    const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
    return error(`Account locked. Try again in ${minutesLeft} minutes.`, 423);
  }

  // Check if account is active
  if (!user.is_active) {
    console.log('[AUTH] Login failed: account is not active');
    return error('Account is disabled. Please contact support.', 403);
  }

  // Check if password is set
  if (!user.password_hash) {
    console.log('[AUTH] Login failed: password not set');
    return error('Password not set. Please use password reset.', 401);
  }

  // Verify password
  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    // Increment login attempts
    const attempts = (user.login_attempts || 0) + 1;
    const updates = { login_attempts: attempts };

    // Lock account after 5 failed attempts (15 minutes)
    if (attempts >= 5) {
      updates.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }

    await db.from('portal_users').update(updates).eq('user_id', user.user_id);

    const remaining = 5 - attempts;
    if (remaining > 0) {
      return error(`Invalid email or password. ${remaining} attempts remaining.`, 401);
    } else {
      return error('Account locked due to too many failed attempts. Try again in 15 minutes.', 423);
    }
  }

  // Reset login attempts on successful login
  await db.from('portal_users').update({
    login_attempts: 0,
    locked_until: null,
    last_login: new Date().toISOString()
  }).eq('user_id', user.user_id);

  // Get client info
  const { data: client } = await db
    .from('clients')
    .select('name, timezone')
    .eq('client_id', user.client_id)
    .single();

  // Generate tokens
  const accessToken = generateAccessToken({
    user_id: user.user_id,
    email: user.email,
    client_id: user.client_id,
    role: user.role
  });

  const refreshToken = generateRefreshToken();
  const { refreshTokenExpiry } = getTokenExpiry();

  // Store refresh token in sessions table
  await db.from('user_sessions').insert({
    user_id: user.user_id,
    refresh_token: refreshToken,
    expires_at: refreshTokenExpiry.toISOString(),
    ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    user_agent: request.headers.get('user-agent') || 'unknown'
  });

  return json({
    success: true,
    accessToken,
    refreshToken,
    expiresIn: 3600, // 1 hour
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      client_id: user.client_id,
      client_name: client?.name || null
    }
  });
}

/**
 * Register new user
 * POST /api/auth/register
 * Body: { email: string, password: string, client_id?: string }
 * Note: For admin to create users, or can be open registration
 */
export async function register(request) {
  const body = await parseBody(request);
  
  if (!body?.email || !body?.password) {
    return error('Email and password are required', 400);
  }

  const email = body.email.toLowerCase().trim();
  const password = body.password;

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return error('Invalid email format', 400);
  }

  // Validate password strength
  if (password.length < 6) {
    return error('Password must be at least 6 characters', 400);
  }

  const db = getAdminClient();

  // Check if user already exists
  const { data: existing } = await db
    .from('portal_users')
    .select('user_id')
    .eq('email', email)
    .single();

  if (existing) {
    return error('An account with this email already exists', 409);
  }

  // Find or create client (by email match)
  let client_id = body.client_id;
  
  if (!client_id) {
    // Check if there's a client with matching email
    const { data: client } = await db
      .from('clients')
      .select('client_id')
      .eq('email', email)
      .single();
    
    client_id = client?.client_id || null;
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const { data: newUser, error: createError } = await db
    .from('portal_users')
    .insert({
      email,
      password_hash: passwordHash,
      client_id,
      role: 'client',
      is_active: true
    })
    .select('user_id, email, client_id, role')
    .single();

  if (createError) {
    console.error('User creation error:', createError);
    return error('Failed to create account', 500);
  }

  // Auto-login: generate tokens
  const accessToken = generateAccessToken({
    user_id: newUser.user_id,
    email: newUser.email,
    client_id: newUser.client_id,
    role: newUser.role
  });

  const refreshToken = generateRefreshToken();
  const { refreshTokenExpiry } = getTokenExpiry();

  await db.from('user_sessions').insert({
    user_id: newUser.user_id,
    refresh_token: refreshToken,
    expires_at: refreshTokenExpiry.toISOString()
  });

  return json({
    success: true,
    message: 'Account created successfully',
    accessToken,
    refreshToken,
    expiresIn: 3600,
    user: {
      user_id: newUser.user_id,
      email: newUser.email,
      role: newUser.role,
      client_id: newUser.client_id
    }
  });
}

/**
 * Get current user info
 * GET /api/auth/me
 * Requires: Authorization header with Bearer token
 */
export async function getMe(request) {
  const token = extractToken(request);
  
  if (!token) {
    return error('Missing authorization token', 401);
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return error('Invalid or expired token', 401);
  }

  const db = getAdminClient();

  // Get fresh user data
  const { data: user, error: userError } = await db
    .from('portal_users')
    .select('user_id, email, client_id, role, is_active, created_at')
    .eq('user_id', payload.user_id)
    .single();

  if (userError || !user) {
    return error('User not found', 404);
  }

  if (!user.is_active) {
    return error('Account is disabled', 403);
  }

  // Get client info
  const { data: client } = await db
    .from('clients')
    .select('name, timezone, email')
    .eq('client_id', user.client_id)
    .single();

  return json({
    user: {
      id: user.user_id,
      email: user.email,
      created_at: user.created_at
    },
    client: client ? {
      client_id: user.client_id,
      name: client.name,
      timezone: client.timezone,
      email: client.email
    } : null,
    role: user.role
  });
}

/**
 * Refresh access token
 * POST /api/auth/refresh
 * Body: { refreshToken: string }
 */
export async function refresh(request) {
  const body = await parseBody(request);
  
  if (!body?.refreshToken) {
    return error('Refresh token is required', 400);
  }

  const db = getAdminClient();

  // Find valid session
  const { data: session, error: sessionError } = await db
    .from('user_sessions')
    .select('session_id, user_id, expires_at')
    .eq('refresh_token', body.refreshToken)
    .single();

  if (sessionError || !session) {
    return error('Invalid refresh token', 401);
  }

  // Check if expired
  if (new Date(session.expires_at) < new Date()) {
    // Delete expired session
    await db.from('user_sessions').delete().eq('session_id', session.session_id);
    return error('Refresh token expired. Please login again.', 401);
  }

  // Get user
  const { data: user } = await db
    .from('portal_users')
    .select('user_id, email, client_id, role, is_active')
    .eq('user_id', session.user_id)
    .single();

  if (!user || !user.is_active) {
    return error('User not found or disabled', 401);
  }

  // Generate new access token
  const accessToken = generateAccessToken({
    user_id: user.user_id,
    email: user.email,
    client_id: user.client_id,
    role: user.role
  });

  return json({
    success: true,
    accessToken,
    expiresIn: 3600
  });
}

/**
 * Logout - invalidate session
 * POST /api/auth/logout
 * Body: { refreshToken: string }
 */
export async function logout(request) {
  const body = await parseBody(request);
  
  if (!body?.refreshToken) {
    // Just return success if no token provided
    return json({ success: true });
  }

  const db = getAdminClient();

  // Delete the session
  await db
    .from('user_sessions')
    .delete()
    .eq('refresh_token', body.refreshToken);

  return json({ success: true, message: 'Logged out successfully' });
}

/**
 * Request password reset OTP
 * POST /api/auth/request-reset
 * Body: { email: string }
 */
export async function requestReset(request) {
  const body = await parseBody(request);
  
  if (!body?.email) {
    return error('Email is required', 400);
  }

  const email = body.email.toLowerCase().trim();
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return error('Invalid email format', 400);
  }

  const db = getAdminClient();

  // Check if user exists
  const { data: user } = await db
    .from('portal_users')
    .select('user_id, email')
    .eq('email', email)
    .single();

  if (!user) {
    // Don't reveal if user exists - still return success
    console.log('Password reset requested for non-existent user:', email);
    return json({ 
      success: true, 
      message: 'If an account exists, a reset code will be sent' 
    });
  }

  // Generate OTP
  const otp = generateOTP();
  const otpHash = hashOTP(otp);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // Delete any existing reset for this email
  await db.from('password_resets').delete().eq('email', email);

  // Insert new reset request
  const { error: insertError } = await db
    .from('password_resets')
    .insert({
      email,
      otp_hash: otpHash,
      expires_at: expiresAt.toISOString(),
      attempts: 0
    });

  if (insertError) {
    console.error('Failed to store reset OTP:', insertError);
    return error('Failed to process request', 500);
  }

  // Log OTP for development (in production, send via email)
  console.log(`🔐 Password Reset OTP for ${email}: ${otp}`);
  console.log(`⏰ Expires at: ${expiresAt.toISOString()}`);

  // TODO: In production, integrate with email service (SendGrid, etc.)
  // await sendEmail(email, 'Password Reset Code', `Your code is: ${otp}`);

  return json({ 
    success: true, 
    message: 'Reset code sent to your email',
    // In development, include OTP (remove in production!)
    ...(process.env.NODE_ENV !== 'production' && { _dev_otp: otp })
  });
}

/**
 * Verify OTP code
 * POST /api/auth/verify-otp
 * Body: { email: string, code: string }
 */
export async function verifyOTPCode(request) {
  const body = await parseBody(request);
  
  if (!body?.email || !body?.code) {
    return error('Email and code are required', 400);
  }

  const email = body.email.toLowerCase().trim();
  const code = body.code.trim();

  if (code.length !== 6 || !/^\d+$/.test(code)) {
    return error('Invalid code format', 400);
  }

  const db = getAdminClient();

  // Get the reset request
  const { data: resetRequest, error: fetchError } = await db
    .from('password_resets')
    .select('*')
    .eq('email', email)
    .single();

  if (fetchError || !resetRequest) {
    return error('No reset request found. Please request a new code.', 400);
  }

  // Check if expired
  if (new Date(resetRequest.expires_at) < new Date()) {
    await db.from('password_resets').delete().eq('email', email);
    return error('Reset code has expired. Please request a new one.', 400);
  }

  // Check attempts (max 5)
  if (resetRequest.attempts >= 5) {
    await db.from('password_resets').delete().eq('email', email);
    return error('Too many attempts. Please request a new code.', 400);
  }

  // Increment attempts
  await db
    .from('password_resets')
    .update({ attempts: resetRequest.attempts + 1 })
    .eq('email', email);

  // Verify OTP
  const codeHash = hashOTP(code);
  if (codeHash !== resetRequest.otp_hash) {
    const remaining = 5 - (resetRequest.attempts + 1);
    return error(`Invalid code. ${remaining} attempts remaining.`, 400);
  }

  // OTP verified! Generate reset token
  const resetToken = generateSecureToken();
  const tokenExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db
    .from('password_resets')
    .update({ 
      reset_token: resetToken,
      token_expires_at: tokenExpires.toISOString(),
      verified_at: new Date().toISOString()
    })
    .eq('email', email);

  return json({ 
    success: true, 
    message: 'Code verified',
    resetToken 
  });
}

/**
 * Reset password after OTP verification
 * POST /api/auth/reset-password
 * Body: { email: string, resetToken: string, newPassword: string }
 */
export async function resetPassword(request) {
  const body = await parseBody(request);
  
  if (!body?.email || !body?.resetToken || !body?.newPassword) {
    return error('Email, reset token, and new password are required', 400);
  }

  const email = body.email.toLowerCase().trim();
  const resetToken = body.resetToken;
  const newPassword = body.newPassword;

  if (newPassword.length < 6) {
    return error('Password must be at least 6 characters', 400);
  }

  const db = getAdminClient();

  // Verify reset token
  const { data: resetRequest, error: fetchError } = await db
    .from('password_resets')
    .select('*')
    .eq('email', email)
    .eq('reset_token', resetToken)
    .single();

  if (fetchError || !resetRequest) {
    return error('Invalid or expired reset session', 400);
  }

  // Check if token expired
  if (new Date(resetRequest.token_expires_at) < new Date()) {
    await db.from('password_resets').delete().eq('email', email);
    return error('Reset session expired. Please start over.', 400);
  }

  // Hash new password
  const passwordHash = await hashPassword(newPassword);

  // Update user's password
  const { error: updateError } = await db
    .from('portal_users')
    .update({ 
      password_hash: passwordHash,
      login_attempts: 0,
      locked_until: null
    })
    .eq('email', email);

  if (updateError) {
    console.error('Password update error:', updateError);
    return error('Failed to update password', 500);
  }

  // Delete the reset request
  await db.from('password_resets').delete().eq('email', email);

  // Invalidate all existing sessions for this user
  const { data: user } = await db
    .from('portal_users')
    .select('user_id')
    .eq('email', email)
    .single();

  if (user) {
    await db.from('user_sessions').delete().eq('user_id', user.user_id);
  }

  return json({
    success: true,
    message: 'Password updated successfully. Please login with your new password.'
  });
}

/**
 * Set password for new onboarding user (OTP verification)
 * POST /api/auth/set-password
 * Body: { email: string, otp: string, password: string }
 */
export async function setPassword(request) {
  const body = await parseBody(request);

  if (!body?.email || !body?.otp || !body?.password) {
    return error('Email, OTP code, and password are required', 400);
  }

  const email = body.email.toLowerCase().trim();
  const otp = body.otp.trim();
  const password = body.password;

  console.log('setPassword called with:', { email, otp: `${otp} (len=${otp.length})` });

  // Validate OTP format (6 digits)
  if (otp.length !== 6 || !/^\d+$/.test(otp)) {
    console.log('OTP format validation failed:', { otp, length: otp.length, isDigits: /^\d+$/.test(otp) });
    return error('Invalid OTP format', 400);
  }

  // Validate password strength
  if (password.length < 6) {
    return error('Password must be at least 6 characters', 400);
  }

  const db = getAdminClient();

  // Hash password before sending to DB function
  const passwordHash = await hashPassword(password);

  // Call verify_otp_and_set_password DB function
  console.log('Calling verify_otp_and_set_password with:', { p_email: email, p_otp: otp });

  const { data, error: rpcError } = await db.rpc('verify_otp_and_set_password', {
    p_email: email,
    p_otp: otp,
    p_password_hash: passwordHash
  });

  console.log('verify_otp_and_set_password result:', { data, rpcError });

  if (rpcError) {
    console.error('Set password RPC error:', rpcError);
    return error('Failed to set password', 500);
  }

  if (!data || data.length === 0 || !data[0].success) {
    const message = data?.[0]?.message || 'Invalid or expired OTP';
    console.log('OTP verification failed:', { data, message });
    return error(message, 400);
  }

  const result = data[0];

  // Get user details for token generation
  const { data: user } = await db
    .from('portal_users')
    .select('user_id, email, client_id, role')
    .eq('user_id', result.user_id)
    .single();

  if (!user) {
    return error('User not found', 404);
  }

  // Get client info
  const { data: client } = await db
    .from('clients')
    .select('name, timezone')
    .eq('client_id', result.client_id)
    .single();

  // Generate tokens for auto-login
  const accessToken = generateAccessToken({
    user_id: user.user_id,
    email: user.email,
    client_id: user.client_id,
    role: user.role
  });

  const refreshToken = generateRefreshToken();
  const { refreshTokenExpiry } = getTokenExpiry();

  // Store refresh token
  await db.from('user_sessions').insert({
    user_id: user.user_id,
    refresh_token: refreshToken,
    expires_at: refreshTokenExpiry.toISOString(),
    ip_address: request.headers.get('x-forwarded-for') || 'unknown',
    user_agent: request.headers.get('user-agent') || 'unknown'
  });

  return json({
    success: true,
    message: 'Password set successfully',
    accessToken,
    refreshToken,
    expiresIn: 3600,
    user: {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      client_id: user.client_id,
      client_name: client?.name || null
    }
  });
}
