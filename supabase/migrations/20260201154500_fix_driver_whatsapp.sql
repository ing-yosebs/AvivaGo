-- Fix WhatsApp numbers for drivers in TrustedDriversSection
-- Also updates the data in driver_profiles to use the phone_number from users table if whatsapp_number is dummy '00000000'

-- 1. Update existing data where whatsapp_number is just zeros
UPDATE public.driver_profiles dp
SET whatsapp_number = u.phone_number
FROM public.users u
WHERE dp.user_id = u.id
AND (dp.whatsapp_number ~ '^[0]+$' OR dp.whatsapp_number IS NULL OR dp.whatsapp_number = '')
AND u.phone_number IS NOT NULL;

-- 2. Update RPC function to be more resilient
CREATE OR REPLACE FUNCTION public.get_trusted_drivers(target_user_id uuid)
 RETURNS TABLE(
    id uuid, 
    created_at timestamp with time zone, 
    driver_profile_id uuid, 
    driver_full_name text, 
    driver_avatar_url text, 
    user_avatar_url text, 
    driver_phone text, 
    driver_whatsapp text, 
    driver_bio text,
    vehicle_brand text, 
    vehicle_model text, 
    vehicle_plate text, 
    review_id uuid, 
    review_rating integer, 
    review_comment text, 
    review_driver_reply text, 
    review_driver_reply_at timestamp with time zone
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.created_at,
    u.driver_profile_id,
    du.full_name as driver_full_name,
    dp.profile_photo_url as driver_avatar_url,
    du.avatar_url as user_avatar_url,
    COALESCE(NULLIF(CASE WHEN dp.whatsapp_number ~ '^[0]+$' THEN NULL ELSE dp.whatsapp_number END, ''), du.phone_number, '00000000') as driver_phone,
    COALESCE(NULLIF(CASE WHEN dp.whatsapp_number ~ '^[0]+$' THEN NULL ELSE dp.whatsapp_number END, ''), du.phone_number, '00000000') as driver_whatsapp,
    COALESCE(ds.professional_questionnaire->>'bio', NULLIF(ds.personal_bio, ''), dp.bio) as driver_bio,
    v.brand as vehicle_brand,
    v.model as vehicle_model,
    v.plate_number as vehicle_plate,
    r.id as review_id,
    r.rating as review_rating,
    r.comment as review_comment,
    r.driver_reply as review_driver_reply,
    r.driver_reply_at as review_driver_reply_at
  FROM public.unlocks u
  JOIN public.driver_profiles dp ON u.driver_profile_id = dp.id
  JOIN public.users du ON dp.user_id = du.id
  LEFT JOIN public.driver_services ds ON dp.id = ds.driver_profile_id
  LEFT JOIN public.vehicles v ON dp.id = v.driver_profile_id AND v.is_active = true
  LEFT JOIN public.reviews r ON u.id = r.unlock_id
  WHERE u.user_id = target_user_id
  ORDER BY u.created_at DESC;
END;
$function$;


