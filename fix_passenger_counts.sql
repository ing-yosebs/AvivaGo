-- Fix B2C Counts (Passengers)
UPDATE driver_profiles dp
SET b2c_referral_count = (
    SELECT COUNT(*)
    FROM users u
    WHERE u.referred_by = dp.user_id
    AND 'client'::user_role_type = ANY(u.roles)
);
