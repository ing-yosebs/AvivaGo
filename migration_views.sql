
-- Migration to add 'views' column to driver_profiles
-- This allows tracking profile visits

ALTER TABLE public.driver_profiles
ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;

-- Optional: Create a separate table for analytics if we want detailed history later
-- But for now, a simple counter on the profile is enough and performant for the dashboard.
