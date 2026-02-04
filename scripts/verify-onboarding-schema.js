/**
 * Verify Onboarding Schema Installation
 * Checks if all required tables and functions exist
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env file manually
const envPath = join(__dirname, '..', '.env');
const envFile = readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
);

async function verifySchema() {
  console.log('🔍 Verifying onboarding schema installation...\n');

  const results = {
    tables: {},
    functions: {},
    columns: {}
  };

  // Check tables
  const tables = ['portal_users', 'onboarding_sessions', 'industry_presets'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(0);

      results.tables[table] = !error;
      console.log(results.tables[table] ? '✅' : '❌', `Table: ${table}`);
      if (error) console.log('   Error:', error.message);
    } catch (err) {
      results.tables[table] = false;
      console.log('❌', `Table: ${table}`);
      console.log('   Error:', err.message);
    }
  }

  console.log();

  // Check client table columns
  console.log('Checking clients table extensions...');
  const clientColumns = ['onboarding_completed', 'onboarding_completed_at', 'industry', 'industry_specific'];

  try {
    const { data, error } = await supabase
      .from('clients')
      .select(clientColumns.join(','))
      .limit(1);

    if (!error) {
      console.log('✅ All clients table columns exist');
      results.columns.clients = true;
    } else {
      console.log('❌ Clients table columns missing:', error.message);
      results.columns.clients = false;
    }
  } catch (err) {
    console.log('❌ Clients table columns check failed:', err.message);
    results.columns.clients = false;
  }

  console.log();

  // Check leads table columns
  console.log('Checking leads table extensions...');
  const leadColumns = ['converted_to_client_id', 'converted_at'];

  try {
    const { data, error } = await supabase
      .from('leads')
      .select(leadColumns.join(','))
      .limit(1);

    if (!error) {
      console.log('✅ All leads table columns exist');
      results.columns.leads = true;
    } else {
      console.log('❌ Leads table columns missing:', error.message);
      results.columns.leads = false;
    }
  } catch (err) {
    console.log('❌ Leads table columns check failed:', err.message);
    results.columns.leads = false;
  }

  console.log();

  // Check functions by attempting test calls
  console.log('Checking database functions...');

  // Test DB functions (using invalid params to check existence)
  const funcTests = [
    { name: 'start_onboarding', params: { p_business_name: 'test', p_contact_email: 'test@test.com' } },
    { name: 'save_onboarding_progress', params: { p_session_id: '00000000-0000-0000-0000-000000000000', p_step_number: 1, p_step_data: {} } },
    { name: 'complete_onboarding', params: { p_session_id: '00000000-0000-0000-0000-000000000000' } },
    { name: 'convert_lead_to_client', params: { p_lead_id: '00000000-0000-0000-0000-000000000000', p_converted_by: 'test' } }
  ];

  for (const fn of funcTests) {
    try {
      const { data, error } = await supabase.rpc(fn.name, fn.params);
      if (error && error.message.includes('Could not find the function')) {
        results.functions[fn.name] = false;
        console.log('❌ Function:', fn.name, '- MISSING');
      } else {
        results.functions[fn.name] = true;
        console.log('✅ Function:', fn.name, '- EXISTS');
      }
    } catch (err) {
      results.functions[fn.name] = false;
      console.log('❌ Function:', fn.name, '-', err.message);
    }
  }

  console.log();
  console.log('📊 Summary:');
  console.log('Tables:', Object.values(results.tables).filter(Boolean).length, '/', tables.length);
  console.log('Column Extensions:', Object.values(results.columns).filter(Boolean).length, '/', 2);
  console.log('Functions: (manual verification recommended)');

  const allTablesExist = Object.values(results.tables).every(Boolean);
  const allColumnsExist = Object.values(results.columns).every(Boolean);

  if (allTablesExist && allColumnsExist) {
    console.log('\n✅ Schema verification passed! Core tables and columns are installed.');
    console.log('ℹ️  Note: Function verification may require manual SQL check or test calls.');
  } else {
    console.log('\n❌ Schema verification failed. Missing components detected.');
    console.log('💡 Run the schema SQL file to install missing components.');
  }

  return results;
}

verifySchema().catch(console.error);
