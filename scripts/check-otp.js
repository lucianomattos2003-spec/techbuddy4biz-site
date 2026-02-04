/**
 * Check OTP stored in portal_users for a specific email
 * Usage: node scripts/check-otp.js <email>
 */

import { createClient } from '@supabase/supabase-js';
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

const email = process.argv[2];

if (!email) {
  console.error('Usage: node scripts/check-otp.js <email>');
  process.exit(1);
}

const db = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkOTP() {
  const { data, error } = await db
    .from('portal_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  if (!data) {
    console.log('No user found with email:', email);
    return;
  }

  console.log('\nPortal User OTP Details:');
  console.log('------------------------');
  console.log('User ID:', data.user_id);
  console.log('Email:', data.email);
  console.log('OTP Code:', data.otp_code || '(null/empty)');
  console.log('OTP Expires At:', data.otp_expires_at || '(null)');
  console.log('Has Password:', data.password_hash ? 'Yes' : 'No');
  console.log('\nAll columns:', Object.keys(data).join(', '));

  if (data.otp_expires_at) {
    const expiresAt = new Date(data.otp_expires_at);
    const now = new Date();
    const isExpired = expiresAt < now;
    console.log('\nExpired:', isExpired ? 'YES - OTP has expired!' : 'No - OTP is still valid');
    console.log('Expires in:', Math.round((expiresAt - now) / 1000 / 60), 'minutes');
  }
}

checkOTP();
