/**
 * Password Hashing Utilities
 * Uses PBKDF2 with SHA-512 for secure password storage
 * Compatible with serverless environments (no native dependencies)
 */

import crypto from 'crypto';

// Configuration
const ITERATIONS = 100000;  // Number of hash iterations
const KEY_LENGTH = 64;      // Output key length in bytes
const DIGEST = 'sha512';    // Hash algorithm
const SALT_LENGTH = 32;     // Salt length in bytes

/**
 * Hash a password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hash in format: salt:hash (both hex encoded)
 */
export async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    // Generate random salt
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verify a password against a hash
 * @param {string} password - Plain text password to verify
 * @param {string} storedHash - Stored hash in format salt:hash
 * @returns {Promise<boolean>} True if password matches
 */
export async function verifyPassword(password, storedHash) {
  return new Promise((resolve, reject) => {
    if (!storedHash || !storedHash.includes(':')) {
      resolve(false);
      return;
    }
    
    const [saltHex, hashHex] = storedHash.split(':');
    const salt = Buffer.from(saltHex, 'hex');
    
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey.toString('hex') === hashHex);
    });
  });
}

/**
 * Generate a random OTP code
 * @param {number} length - Length of OTP (default 6)
 * @returns {string} Numeric OTP
 */
export function generateOTP(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Hash an OTP for storage (simple SHA256, not for passwords)
 * @param {string} otp - OTP to hash
 * @returns {string} SHA256 hash
 */
export function hashOTP(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Generate a secure random token
 * @param {number} bytes - Number of random bytes (default 32)
 * @returns {string} Hex-encoded token
 */
export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}
