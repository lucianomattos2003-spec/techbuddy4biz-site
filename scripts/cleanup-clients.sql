-- ============================================================================
-- CLEANUP CLIENTS SCRIPT
-- Keep only: client_id = '8f586156-be94-484b-98ab-190c0d1f7de4' (TechBuddy4Biz)
-- ============================================================================

-- ============================================================================
-- PART 1: PREVIEW - Run this first to see what will be deleted
-- ============================================================================

-- List clients that WILL BE DELETED
SELECT '=== CLIENTS TO BE DELETED ===' as section;
SELECT client_id, client_key, name, status, created_at
FROM clients
WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
ORDER BY name;

-- List the client that will be KEPT
SELECT '=== CLIENT TO KEEP ===' as section;
SELECT client_id, client_key, name, status, created_at
FROM clients
WHERE client_id = '8f586156-be94-484b-98ab-190c0d1f7de4';

-- Count records in related tables for clients TO BE DELETED
SELECT 'social_posts' as table_name, COUNT(*) as record_count
FROM social_posts WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'social_themes', COUNT(*) FROM social_themes WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'social_prompts', COUNT(*) FROM social_prompts WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'social_schedules', COUNT(*) FROM social_schedules WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'social_assets', COUNT(*) FROM social_assets WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'social_batches', COUNT(*) FROM social_batches WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'portal_users', COUNT(*) FROM portal_users WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'client_branding', COUNT(*) FROM client_branding WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'client_rules', COUNT(*) FROM client_rules WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'social_hashtag_packs', COUNT(*) FROM social_hashtag_packs WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
UNION ALL
SELECT 'onboarding_sessions', COUNT(*) FROM onboarding_sessions WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';

-- ============================================================================
-- PART 2: DELETE - Run this AFTER reviewing the preview
-- IMPORTANT: Run these in order due to foreign key constraints
-- ============================================================================

/*
-- UNCOMMENT AND RUN THESE AFTER REVIEWING THE PREVIEW ABOVE

-- Step 1: Delete user_sessions for users being deleted
DELETE FROM user_sessions
WHERE user_id IN (
  SELECT user_id FROM portal_users
  WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4'
);

-- Step 2: Delete child records (no specific order needed for these)
DELETE FROM social_posts WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';
DELETE FROM social_themes WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';
DELETE FROM social_prompts WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';
DELETE FROM social_schedules WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';
DELETE FROM tasks WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';
DELETE FROM social_assets WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';
DELETE FROM social_batches WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';
DELETE FROM client_branding WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';
DELETE FROM client_rules WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';
DELETE FROM social_hashtag_packs WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';
DELETE FROM onboarding_sessions WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';

-- Step 3: Delete portal_users (after their sessions are deleted)
DELETE FROM portal_users WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';

-- Step 4: Finally delete the clients
DELETE FROM clients WHERE client_id != '8f586156-be94-484b-98ab-190c0d1f7de4';

-- Verify cleanup
SELECT 'Remaining clients:' as status, COUNT(*) as count FROM clients;
SELECT 'Remaining posts:' as status, COUNT(*) as count FROM social_posts;

*/
