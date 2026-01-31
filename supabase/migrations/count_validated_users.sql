-- Function to count validated users
-- Returns the number of users who have confirmed their email address.

CREATE OR REPLACE FUNCTION public.get_validated_user_count()
RETURNS INTEGER
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM auth.users
  WHERE email_confirmed_at IS NOT NULL;
$$;

-- Grant execute permission to anon and authenticated roles so it can be called via RPC if needed, 
-- though we will likely call it from a server action using a service role or proper auth context.
GRANT EXECUTE ON FUNCTION public.get_validated_user_count() TO anon, authenticated, service_role;
