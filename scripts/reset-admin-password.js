/**
 * Reset admin password
 * Usage: node scripts/reset-admin-password.js
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Password hashing (same as lib/password.js)
const ITERATIONS = 100000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';
const SALT_LENGTH = 32;

async function hashPassword(password) {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH);
    crypto.pbkdf2(password, salt, ITERATIONS, KEY_LENGTH, DIGEST, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(`${salt.toString('hex')}:${derivedKey.toString('hex')}`);
    });
  });
}

async function resetPassword() {
  const email = 'admin@techbuddy4biz.com';
  const newPassword = 'Admin123!';

  console.log('Resetting password for:', email);
  console.log('New password:', newPassword);

  const passwordHash = await hashPassword(newPassword);

  const { data, error } = await db
    .from('portal_users')
    .update({
      password_hash: passwordHash,
      login_attempts: 0,
      locked_until: null
    })
    .eq('email', email)
    .select('user_id, email, role');

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.error('User not found:', email);
    return;
  }

  console.log('\nPassword reset successful!');
  console.log('User:', data[0]);
  console.log('\nYou can now login with:');
  console.log('  Email:', email);
  console.log('  Password:', newPassword);
}

resetPassword();
