-- RLS Fix for Trusted Drivers Visibility
-- Run this script in your Supabase SQL Editor

-- 1. Ensure Unlocks table has RLS enabled
ALTER TABLE public.unlocks ENABLE ROW LEVEL SECURITY;

-- 2. Allow users to see their OWN unlocks (transactions they made)
-- Without this, query to 'unlocks' returns empty for everyone except maybe admin if they have bypass
DROP POLICY IF EXISTS "Users can view own unlocks" ON public.unlocks;
CREATE POLICY "Users can view own unlocks" 
ON public.unlocks 
FOR SELECT 
USING (auth.uid() = user_id);

-- 3. Allow viewing User details (Name, etc) for Active Drivers
-- This is needed because 'Trusted Drivers' page joins 'users' table to get the name.
-- If 'users' table only allows "auth.uid() = id", you can never see the name of the driver you unlocked.
DROP POLICY IF EXISTS "Public can view active driver users" ON public.users;
CREATE POLICY "Public can view active driver users" 
ON public.users 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.driver_profiles dp
    WHERE dp.user_id = public.users.id
    AND dp.status = 'active'
    AND dp.is_visible = true
  )
);
