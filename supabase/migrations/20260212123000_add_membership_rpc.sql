-- Function to manually extend membership
-- Corresponds to the missing function reported in the error

CREATE OR REPLACE FUNCTION admin_extend_membership(
    target_profile_id UUID, 
    new_expiry TIMESTAMP WITH TIME ZONE, 
    admin_notes TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check for Admin Role
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND 'admin' = ANY(roles)
    ) THEN
        RAISE EXCEPTION 'Access Denied: Only admins can extend memberships';
    END IF;

    -- Update existing membership
    UPDATE driver_memberships
    SET 
        origin = 'admin_grant',
        status = 'active',
        expires_at = new_expiry,
        granted_by = auth.uid(),
        notes = admin_notes,
        updated_at = NOW()
    WHERE driver_profile_id = target_profile_id;
    
    -- Fallback: Insert if not found (e.g. legacy data)
    IF NOT FOUND THEN
        INSERT INTO driver_memberships (
            driver_profile_id,
            origin,
            status,
            expires_at,
            granted_by,
            notes
        ) VALUES (
            target_profile_id,
            'admin_grant',
            'active',
            new_expiry,
            auth.uid(),
            admin_notes
        );
    END IF;
END;
$$;
