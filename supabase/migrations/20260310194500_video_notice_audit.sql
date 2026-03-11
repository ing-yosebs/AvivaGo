-- Migration to add video notice audit columns and table
-- Date: 2026-03-10
-- Author: Antigravity

-- 1. Add video_notice_accepted_at to driver_services if it doesn't exist
ALTER TABLE public.driver_services 
ADD COLUMN IF NOT EXISTS video_notice_accepted_at TIMESTAMPTZ;

-- 2. Create the video_notice_logs table for traceability
CREATE TABLE IF NOT EXISTS public.video_notice_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'enabled', 'disabled'
    accepted_at TIMESTAMPTZ DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS and set policies
ALTER TABLE public.video_notice_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers can view their own video notice logs" 
ON public.video_notice_logs FOR SELECT 
USING (auth.uid() IN (SELECT user_id FROM public.driver_profiles WHERE id = driver_profile_id));

-- 4. Re-create or refresh any views if necessary (not needed for PostgREST joins usually, but good for clarity)
-- The driver_profiles_public view already has created_at as part of its definition.
