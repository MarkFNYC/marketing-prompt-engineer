-- Migration: RLS Hardening
-- Date: 2025-02-06
-- Description: Enable RLS on profiles, projects, saved_content tables
--              and add missing UPDATE/DELETE policies to strategy_checks.

-- ============================================================
-- profiles: users can only read/update their own profile row.
-- The profile id matches auth.users(id).
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- INSERT is handled by the signup API route using the service role key,
-- so no INSERT policy is needed for regular users.

-- DELETE is handled by the account deletion API route using the service
-- role key, so no DELETE policy is needed for regular users.

-- ============================================================
-- projects: users can CRUD their own projects.
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects" ON projects
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- saved_content: users can CRUD their own saved content.
-- ============================================================
ALTER TABLE saved_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own saved content" ON saved_content
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- strategy_checks: add missing UPDATE and DELETE policies.
-- SELECT and INSERT policies already exist from the original migration.
-- ============================================================
CREATE POLICY "Users can update own strategy checks" ON strategy_checks
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategy checks" ON strategy_checks
    FOR DELETE USING (auth.uid() = user_id);
