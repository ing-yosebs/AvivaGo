-- RETROACTIVE FAVORITES RESTORE AND LOCK
-- 1. Inserts missing favorites (Restores deleted ones)
-- 2. Updates existing referral favorites to be locked

DO $$
DECLARE 
    r RECORD;
    restored_count INT := 0;
    locked_count INT := 0;
BEGIN
    FOR r IN 
        SELECT 
            u.id AS user_id, 
            dp.id AS driver_profile_id
        FROM public.users u
        JOIN public.driver_profiles dp ON dp.user_id = u.referred_by
        WHERE u.referred_by IS NOT NULL
    LOOP
        BEGIN
            -- 1. Intentar Insertar (Restaurar) con is_locked = true
            INSERT INTO public.favorites (user_id, driver_profile_id, is_locked)
            VALUES (r.user_id, r.driver_profile_id, true)
            ON CONFLICT (user_id, driver_profile_id) 
            DO UPDATE SET is_locked = true; -- 2. Si ya existe, asegurar que esté bloqueado
            
            IF FOUND THEN
                restored_count := restored_count + 1;
            END IF;

        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error processing user %: %', r.user_id, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE 'Proceso completado. Registros procesados (Restaurados o Bloqueados): %', restored_count;
END $$;
