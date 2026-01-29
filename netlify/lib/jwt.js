/**
 * JWT Token Utilities for App-Level Auth
 * Uses HS256 algorithm with a secret key
 */

import crypto from 'crypto';

// Use environment variable or generate a random secret (for dev)
const JWT_SECRET = process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_KEY || 'dev-secret-change-in-production';
const ACCESS_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds

/**
 * Base64URL encode
 */
function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decode
 */
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString();
}

/**
 * Create HMAC signature
 */
function createSignature(data, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Generate JWT access token
 * @param {Object} payload - Token payload (user_id, email, client_id, role)
 * @param {number} expiresIn - Expiry in seconds (default 1 hour)
 * @returns {string} JWT token
 */
export function generateAccessToken(payload, expiresIn = ACCESS_TOKEN_EXPIRY) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn,
    type: 'access'
  };

  const headerEncoded = base64UrlEncode(JSON.stringify(header));
  const payloadEncoded = base64UrlEncode(JSON.stringify(tokenPayload));
  const signature = createSignature(`${headerEncoded}.${payloadEncoded}`, JWT_SECRET);

  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

/**
 * Generate refresh token (random string)
 * @returns {string} Refresh token
 */
export function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyToken(token) {
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerEncoded, payloadEncoded, signature] = parts;

    // Verify signature
    const expectedSignature = createSignature(`${headerEncoded}.${payloadEncoded}`, JWT_SECRET);
    if (signature !== expectedSignature) {
      console.log('JWT signature mismatch');
      return null;
    }

    // Decode payload
    const payload = JSON.parse(base64UrlDecode(payloadEncoded));

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log('JWT expired');
      return null;
    }

    return payload;
  } catch (e) {
    console.error('JWT verification error:', e.message);
    return null;
  }
}

/**
 * Get token expiry timestamps
 */
export function getTokenExpiry() {
  const now = new Date();
  return {
    accessTokenExpiry: new Date(now.getTime() + ACCESS_TOKEN_EXPIRY * 1000),
    refreshTokenExpiry: new Date(now.getTime() + REFRESH_TOKEN_EXPIRY * 1000)
  };
}

export { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY };
