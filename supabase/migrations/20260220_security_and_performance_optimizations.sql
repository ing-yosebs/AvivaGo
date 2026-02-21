
-- 1. SECURITY: ENABLE RLS ON MISSING TABLES
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.driver_service_tags ENABLE ROW LEVEL SECURITY;

-- 1.1 Add Policies for newly enabled RLS
-- Verification Codes (Previous linter warning fix)
DROP POLICY IF EXISTS "Anon can insert verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Anon can select matching verification codes" ON public.verification_codes;

CREATE POLICY "Service Role full access" ON public.verification_codes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Anon can insert verification codes" ON public.verification_codes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can select matching verification codes" ON public.verification_codes FOR SELECT TO anon USING (true);

-- Wallets
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT TO authenticated 
USING ((select auth.uid()) = user_id);

CREATE POLICY "Admins can manage all wallets" ON public.wallets FOR ALL TO authenticated 
USING (((select auth.jwt() -> 'app_metadata' -> 'roles') ? 'admin'));

-- Wallet Transactions
CREATE POLICY "Users can view own transactions" ON public.wallet_transactions FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.wallets w WHERE w.id = wallet_id AND w.user_id = (select auth.uid())));

-- Reports
CREATE POLICY "Users can view own reports as reporter" ON public.reports FOR SELECT TO authenticated 
USING ((select auth.uid()) = reporter_id);

CREATE POLICY "Admins can manage all reports" ON public.reports FOR ALL TO authenticated 
USING (((select auth.jwt() -> 'app_metadata' -> 'roles') ? 'admin'));

-- Tags
CREATE POLICY "Anyone can view active service tags" ON public.service_tags FOR SELECT TO public 
USING (is_active = true);

CREATE POLICY "Anyone can view driver service tags" ON public.driver_service_tags FOR SELECT TO public 
USING (true);

-- 2. PERFORMANCE: INDEX MISSING FOREIGN KEYS
CREATE INDEX IF NOT EXISTS idx_driver_memberships_granted_by ON public.driver_memberships(granted_by);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_country_code ON public.driver_profiles(country_code);
CREATE INDEX IF NOT EXISTS idx_driver_profiles_zone_id ON public.driver_profiles(zone_id);
CREATE INDEX IF NOT EXISTS idx_driver_status_logs_actor_id ON public.driver_status_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_driver_status_logs_driver_profile_id ON public.driver_status_logs(driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_email_change_logs_user_id ON public.email_change_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_driver_profile_id ON public.favorites(driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_pending_payments_driver_profile_id ON public.pending_payments(driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_phone_change_logs_user_id ON public.phone_change_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_quote_audit_logs_actor_id ON public.quote_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_quote_audit_logs_quote_id ON public.quote_audit_logs(quote_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_driver_id ON public.quote_requests(driver_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_passenger_id ON public.quote_requests(passenger_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_driver_profile_id ON public.reports(reported_driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON public.reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_resolved_by ON public.reports(resolved_by);
CREATE INDEX IF NOT EXISTS idx_review_likes_user_id ON public.review_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_driver_profile_id ON public.reviews(driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_unlocks_driver_profile_id ON public.unlocks(driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_driver_profile_id ON public.vehicles(driver_profile_id);
CREATE INDEX IF NOT EXISTS idx_zones_country_code ON public.zones(country_code);

-- 3. PERFORMANCE: OPTIMIZE EXISTING RLS POLICIES (Wrap auth.uid() and auth.jwt() in subqueries)
-- This allows Postgres to cache the results instead of re-evaluating for every row.

-- Users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT TO public USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE TO public USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users FOR SELECT TO public 
USING ((((select auth.jwt()) -> 'app_metadata'::text) -> 'roles'::text) @> '["admin"]'::jsonb);

DROP POLICY IF EXISTS "Admins can update all users" ON public.users;
CREATE POLICY "Admins can update all users" ON public.users FOR UPDATE TO public 
USING ((((select auth.jwt()) -> 'app_metadata'::text) -> 'roles'::text) @> '["admin"]'::jsonb);

-- Driver Profiles
DROP POLICY IF EXISTS "Drivers manage own profile" ON public.driver_profiles;
CREATE POLICY "Drivers manage own profile" ON public.driver_profiles FOR ALL TO public USING ((select auth.uid()) = user_id);

-- Pending Payments
DROP POLICY IF EXISTS "Users can view their own pending payments" ON public.pending_payments;
CREATE POLICY "Users can view their own pending payments" ON public.pending_payments FOR SELECT TO authenticated USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can insert their own pending payments" ON public.pending_payments;
CREATE POLICY "Users can insert their own pending payments" ON public.pending_payments FOR INSERT TO authenticated WITH CHECK ((select auth.uid()) = user_id);

-- Identity Verifications
DROP POLICY IF EXISTS "Users can view own identity verifications" ON public.identity_verifications;
CREATE POLICY "Users can view own identity verifications" ON public.identity_verifications FOR SELECT TO public USING ((select auth.uid()) = user_id);
