-- System Monitoring and Versioning Tables

-- 1. Create RPC to get database size (Requires SECURITY DEFINER to bypass RLS/Permissions)
CREATE OR REPLACE FUNCTION get_db_size()
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN pg_database_size(current_database());
END;
$$;

-- 1b. Create RPC to get total storage bucket size
CREATE OR REPLACE FUNCTION get_storage_size()
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    total_bytes BIGINT;
BEGIN
    SELECT COALESCE(SUM((metadata->>'size')::BIGINT), 0) INTO total_bytes FROM storage.objects;
    RETURN total_bytes;
END;
$$;

-- 1c. Create RPC to get accurate auth users metrics with monthly constraints
CREATE OR REPLACE FUNCTION get_system_auth_metrics(month_start TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
    total_users BIGINT, 
    monthly_users BIGINT,
    emails_confirmed BIGINT, 
    monthly_emails_confirmed BIGINT,
    phones_confirmed BIGINT,
    monthly_phones_confirmed BIGINT,
    email_changes BIGINT,
    monthly_email_changes BIGINT,
    phone_changes BIGINT,
    monthly_phone_changes BIGINT,
    email_codes BIGINT,
    monthly_email_codes BIGINT,
    phone_codes BIGINT,
    monthly_phone_codes BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        (SELECT COUNT(*)::BIGINT FROM auth.users),
        (SELECT COUNT(*)::BIGINT FROM auth.users WHERE created_at >= month_start),
        
        (SELECT COUNT(email_confirmed_at)::BIGINT FROM auth.users),
        (SELECT COUNT(*)::BIGINT FROM auth.users WHERE email_confirmed_at >= month_start),
        
        (SELECT COUNT(phone_confirmed_at)::BIGINT FROM auth.users),
        (SELECT COUNT(*)::BIGINT FROM auth.users WHERE phone_confirmed_at >= month_start),
        
        (SELECT COUNT(*)::BIGINT FROM public.email_change_logs),
        (SELECT COUNT(*)::BIGINT FROM public.email_change_logs WHERE changed_at >= month_start),
        
        (SELECT COUNT(*)::BIGINT FROM public.phone_change_logs),
        (SELECT COUNT(*)::BIGINT FROM public.phone_change_logs WHERE changed_at >= month_start),
        
        (SELECT COUNT(*)::BIGINT FROM public.email_verification_codes),
        (SELECT COUNT(*)::BIGINT FROM public.email_verification_codes WHERE created_at >= month_start),
        
        (SELECT COUNT(*)::BIGINT FROM public.verification_codes),
        (SELECT COUNT(*)::BIGINT FROM public.verification_codes WHERE created_at >= month_start);
END;
$$;

-- 2. Create github_deployment_logs table
CREATE TABLE IF NOT EXISTS public.github_deployment_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    estimated_minutes INTEGER NOT NULL DEFAULT 3,
    triggered_by TEXT,
    commit_hash TEXT
);

-- Enable RLS for github_deployment_logs (Only service role can access)
ALTER TABLE public.github_deployment_logs ENABLE ROW LEVEL SECURITY;

-- 3. Create system_versions table
CREATE TABLE IF NOT EXISTS public.system_versions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    version_tag TEXT NOT NULL,
    release_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    changes_description TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'feature', -- feature, bugfix, hotfix
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for system_versions
ALTER TABLE public.system_versions ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users for the changelog
CREATE POLICY "Enable read access for authenticated users" ON public.system_versions FOR SELECT TO authenticated USING (true);
