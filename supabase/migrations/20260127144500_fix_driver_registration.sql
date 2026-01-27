-- Fix recursion in sync_user_roles_to_metadata
CREATE OR REPLACE FUNCTION public.sync_user_roles_to_metadata()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = 
    coalesce(raw_app_meta_data, '{}'::jsonb) || 
    jsonb_build_object('roles', NEW.roles)
  WHERE id = NEW.id
    -- Only update if roles have actually changed in the metadata
    AND (
      raw_app_meta_data->'roles' IS NULL OR 
      NOT (raw_app_meta_data->'roles' @> to_jsonb(NEW.roles) AND raw_app_meta_data->'roles' <@ to_jsonb(NEW.roles))
    );
  RETURN NEW;
END;
$function$;

-- Fix role assignment and referrals in handle_auth_user_sync
CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  referrer_id uuid;
BEGIN
  -- Try to find referrer if code exists in metadata
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    SELECT id INTO referrer_id FROM public.users WHERE referral_code = (NEW.raw_user_meta_data->>'referral_code');
  END IF;

  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.users (id, email, full_name, avatar_url, email_confirmed_at, roles, referred_by)
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sem Nombre'),
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.email_confirmed_at,
      ARRAY[COALESCE(NEW.raw_user_meta_data->>'role', 'client')]::user_role_type[],
      referrer_id
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      email_confirmed_at = EXCLUDED.email_confirmed_at,
      roles = CASE 
        WHEN EXCLUDED.roles IS NOT NULL AND EXCLUDED.roles <> '{}' THEN EXCLUDED.roles 
        ELSE public.users.roles 
      END;
  ELSIF (TG_OP = 'UPDATE') THEN
    -- Prevent recursion: Only update if relevant fields changed
    IF (NEW.email IS DISTINCT FROM OLD.email) OR 
       (NEW.email_confirmed_at IS DISTINCT FROM OLD.email_confirmed_at) OR 
       (NEW.raw_user_meta_data->>'role' IS DISTINCT FROM OLD.raw_user_meta_data->>'role') THEN
       
      UPDATE public.users
      SET 
        email = NEW.email,
        email_confirmed_at = NEW.email_confirmed_at,
        roles = CASE 
            WHEN NEW.raw_user_meta_data->>'role' IS NOT NULL THEN ARRAY[NEW.raw_user_meta_data->>'role']::user_role_type[]
            ELSE roles 
        END,
        updated_at = NOW()
      WHERE id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
