
-- 1. Add views column
ALTER TABLE public.driver_profiles 
ADD COLUMN IF NOT EXISTS views INT DEFAULT 0;

-- 2. Create RPC function to increment safely without exposing update permissions on the whole table
CREATE OR REPLACE FUNCTION increment_profile_view(profile_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.driver_profiles
  SET views = views + 1
  WHERE id = profile_id;
END;
$$;
