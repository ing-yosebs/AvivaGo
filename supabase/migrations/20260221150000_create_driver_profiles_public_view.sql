CREATE OR REPLACE VIEW public.driver_profiles_public AS
SELECT 
    d.id,
    d.bio,
    d.profile_photo_url,
    d.cover_photo_url,
    d.city,
    d.status,
    d.is_visible,
    d.average_rating,
    d.total_reviews,
    d.verified_at,
    d.created_at,
    d.views,
    d.country_code,
    
    u.full_name as user_full_name,
    u.avatar_url as user_avatar_url,
    u.address_state as user_address_state,
    u.referral_code as user_referral_code,
    
    (d.status = 'active' AND d.verified_at IS NOT NULL) as is_verified
FROM public.driver_profiles d
LEFT JOIN public.users u ON d.user_id = u.id;

-- Grant access to the API
GRANT SELECT ON public.driver_profiles_public TO anon;
GRANT SELECT ON public.driver_profiles_public TO authenticated;
GRANT SELECT ON public.driver_profiles_public TO service_role;
