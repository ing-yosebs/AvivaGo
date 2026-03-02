-- Added JSONB column to track specific UI UI onboarding actions (steps 4, 5, 6)
ALTER TABLE public.driver_profiles 
ADD COLUMN IF NOT EXISTS onboarding_flags JSONB DEFAULT '{}'::jsonb;
