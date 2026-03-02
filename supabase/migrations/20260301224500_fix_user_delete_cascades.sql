-- 1. unlocks (CASCADE)
ALTER TABLE unlocks DROP CONSTRAINT IF EXISTS unlocks_user_id_fkey;
ALTER TABLE unlocks ADD CONSTRAINT unlocks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 2. reviews (CASCADE)
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_reviewer_id_fkey;
ALTER TABLE reviews ADD CONSTRAINT reviews_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. reports ( CASCADE for reporter_id, SET NULL for resolved_by)
ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_reporter_id_fkey;
ALTER TABLE reports ADD CONSTRAINT reports_reporter_id_fkey FOREIGN KEY (reporter_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE reports DROP CONSTRAINT IF EXISTS reports_resolved_by_fkey;
ALTER TABLE reports ADD CONSTRAINT reports_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- 4. driver_memberships (SET NULL for granted_by)
ALTER TABLE driver_memberships DROP CONSTRAINT IF EXISTS driver_memberships_granted_by_fkey;
ALTER TABLE driver_memberships ADD CONSTRAINT driver_memberships_granted_by_fkey FOREIGN KEY (granted_by) REFERENCES public.users(id) ON DELETE SET NULL;

-- 5. driver_status_logs (Make actor_id NULLABLE, then SET NULL)
ALTER TABLE driver_status_logs ALTER COLUMN actor_id DROP NOT NULL;
ALTER TABLE driver_status_logs DROP CONSTRAINT IF EXISTS driver_status_logs_actor_id_fkey;
ALTER TABLE driver_status_logs ADD CONSTRAINT driver_status_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES public.users(id) ON DELETE SET NULL;

-- 6. quote_audit_logs (actor_id SET NULL references auth.users)
ALTER TABLE quote_audit_logs DROP CONSTRAINT IF EXISTS quote_audit_logs_actor_id_fkey;
ALTER TABLE quote_audit_logs ADD CONSTRAINT quote_audit_logs_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- 7. email_change_logs (user_id references auth.users -> CASCADE)
ALTER TABLE email_change_logs DROP CONSTRAINT IF EXISTS email_change_logs_user_id_fkey;
ALTER TABLE email_change_logs ADD CONSTRAINT email_change_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 8. users (referred_by SET NULL)
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_referred_by_fkey;
ALTER TABLE users ADD CONSTRAINT users_referred_by_fkey FOREIGN KEY (referred_by) REFERENCES public.users(id) ON DELETE SET NULL;
