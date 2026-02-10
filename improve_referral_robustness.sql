-- MEJORA DE ROBUSTEZ: Sincronización automática de contadores de referidos
-- Este script asegura que los contadores en driver_profiles se mantengan exactos
-- incluso ante eliminaciones de usuarios o cambios de estatus de membresía.

-- 1. Función para manejar eliminaciones de usuarios
CREATE OR REPLACE FUNCTION public.sync_referral_counters_on_delete()
RETURNS TRIGGER AS $$
DECLARE
    referrer_id UUID;
BEGIN
    referrer_id := OLD.referred_by;
    
    IF referrer_id IS NOT NULL THEN
        -- Si era un Pasajero
        IF 'client' = ANY(OLD.roles) THEN
            UPDATE public.driver_profiles 
            SET b2c_referral_count = GREATEST(0, b2c_referral_count - 1)
            WHERE user_id = referrer_id;
        
        -- Si era un Conductor
        ELSIF 'driver' = ANY(OLD.roles) THEN
            -- Verificamos si era un conductor activo (pagado) al momento de ser borrado
            IF EXISTS (
                SELECT 1 FROM public.driver_memberships dm
                JOIN public.driver_profiles dp ON dp.id = dm.driver_profile_id
                WHERE dp.user_id = OLD.id 
                AND dm.status = 'active' 
                AND dm.origin = 'paid'
            ) THEN
                UPDATE public.driver_profiles 
                SET referral_count = GREATEST(0, referral_count - 1)
                WHERE user_id = referrer_id;
            ELSE
                UPDATE public.driver_profiles 
                SET referral_count_pending = GREATEST(0, referral_count_pending - 1)
                WHERE user_id = referrer_id;
            END IF;
        END IF;
    END IF;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para DELETE en users
DROP TRIGGER IF EXISTS on_user_deleted_sync_counters ON public.users;
CREATE TRIGGER on_user_deleted_sync_counters
    AFTER DELETE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_referral_counters_on_delete();


-- 2. Mejorar la función de comisiones B2B para manejar cambios de 'active' a otros estados
CREATE OR REPLACE FUNCTION process_b2b_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    referrer_user_id UUID;
    referrer_wallet_id UUID;
    referrer_driver_id UUID;
    current_level affiliate_level;
    commission_amount DECIMAL;
    is_now_active_paid BOOLEAN;
    was_active_paid BOOLEAN;
BEGIN
    is_now_active_paid := (NEW.status = 'active' AND NEW.origin = 'paid');
    was_active_paid := (OLD.status = 'active' AND OLD.origin = 'paid');

    -- Solo actuar si hay un cambio en el estado de "Activo Pagado"
    IF is_now_active_paid = was_active_paid THEN
        RETURN NEW;
    END IF;

    -- Buscar quién refirió a este conductor
    SELECT u.referred_by INTO referrer_user_id
    FROM public.driver_profiles dp
    JOIN public.users u ON u.id = dp.user_id
    WHERE dp.id = NEW.driver_profile_id;

    IF referrer_user_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- Obtener datos del Referente
    SELECT w.id, dp.id, dp.affiliate_level 
    INTO referrer_wallet_id, referrer_driver_id, current_level
    FROM public.users u
    LEFT JOIN public.wallets w ON w.user_id = u.id
    JOIN public.driver_profiles dp ON dp.user_id = u.id
    WHERE u.id = referrer_user_id;

    IF referrer_driver_id IS NULL THEN
        RETURN NEW;
    END IF;

    -- CASO 1: SE ACTIVA (Pasa de Pendiente a Activo)
    IF is_now_active_paid AND NOT was_active_paid THEN
        -- Calcular Monto según nivel actual
        CASE current_level
            WHEN 'bronze' THEN commission_amount := 80.00;
            WHEN 'silver' THEN commission_amount := 100.00;
            WHEN 'gold'   THEN commission_amount := 120.00;
            ELSE commission_amount := 80.00;
        END CASE;

        -- Insertar Transacción Pendiente si hay wallet
        IF referrer_wallet_id IS NOT NULL THEN
            INSERT INTO public.wallet_transactions (
                wallet_id, amount, transaction_type, status, 
                source_reference_id, description, available_at
            ) VALUES (
                referrer_wallet_id,
                commission_amount,
                'commission_activation',
                'pending',
                NEW.driver_profile_id,
                'Comisión por activación de conductor referido',
                NOW() + INTERVAL '15 days'
            );
            UPDATE public.wallets SET balance_pending = balance_pending + commission_amount WHERE id = referrer_wallet_id;
        END IF;

        -- Mover contador de Pendiente a Activo
        UPDATE public.driver_profiles
        SET 
            referral_count = referral_count + 1,
            referral_count_pending = GREATEST(0, referral_count_pending - 1)
        WHERE id = referrer_driver_id;

    -- CASO 2: SE DESACTIVA (Pasa de Activo a Expirado/Cancelado)
    ELSIF NOT is_now_active_paid AND was_active_paid THEN
        -- Mover contador de Activo de vuelta a Pendiente
        UPDATE public.driver_profiles
        SET 
            referral_count = GREATEST(0, referral_count - 1),
            referral_count_pending = referral_count_pending + 1
        WHERE id = referrer_driver_id;
    END IF;

    RETURN NEW;
END;
$$;
