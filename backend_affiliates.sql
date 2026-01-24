
-- MIGRACIÓN: PROGRAMA DE AFILIADOS Y MONEDERO (B2B + B2C)

-- 1. ACTUALIZACIÓN DE USUARIOS (Soporte de Referidos)
-- Agregamos campos para tracking de quién invitó a quién y saldo de créditos (pasajeros)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS passenger_credits INT DEFAULT 0;

-- Index para búsquedas rápidas de referidos
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);

-- 2. EXTENSIÓN DE PERFIL DE CONDUCTOR (Niveles y Estadísticas)
CREATE TYPE affiliate_level AS ENUM ('bronze', 'silver', 'gold');

ALTER TABLE driver_profiles
ADD COLUMN IF NOT EXISTS affiliate_level affiliate_level DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS referral_count INT DEFAULT 0, -- Cache de referidos activos (conductores)
ADD COLUMN IF NOT EXISTS b2c_referral_count INT DEFAULT 0; -- Cache de pasajeros referidos

-- 3. BILLETERA (WALLET) - Gestión Financiera
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    balance_pending DECIMAL(12, 2) DEFAULT 0.00,
    balance_available DECIMAL(12, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TRANSACCIONES DE BILLETERA
CREATE TYPE wallet_tx_type AS ENUM (
    'commission_activation', -- B2B: Bono por activación (Primer año)
    'commission_renewal',    -- B2B: Comisión recurrente
    'bonus_volume_b2c',      -- B2C: Bono por meta de 20/100 pasajeros
    'withdrawal',            -- Retiro de fondos
    'internal_payment',      -- Pago de servicios Aviva (Publicidad, Membresía propia)
    'adjustment'             -- Ajuste administrativo
);

CREATE TYPE wallet_tx_status AS ENUM ('pending', 'available', 'paid', 'cancelled', 'rejected');

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    
    amount DECIMAL(12, 2) NOT NULL, -- Positivo (ingreso) o Negativo (egreso)
    transaction_type wallet_tx_type NOT NULL,
    status wallet_tx_status DEFAULT 'pending',
    
    source_reference_id UUID, -- ID del usuario/conductor que generó la ganancia
    description TEXT,
    
    available_at TIMESTAMP WITH TIME ZONE, -- Fecha de liberación (15 días)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_wallet ON wallet_transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_status_date ON wallet_transactions(status, available_at);

-- 5. LÓGICA DE NEGOCIO (FUNCTIONS & TRIGGERS)

-- 5.1 Generar Código de Referido Automático al crear Usuario y Asignar Referente
CREATE OR REPLACE FUNCTION generate_referral_code_and_attribute()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    ref_code TEXT;
    referrer_id UUID;
    referrer_wallet_id UUID;
BEGIN
    -- A. Generar Código Único para este usuario si no tiene
    IF NEW.referral_code IS NULL THEN
        -- Intentar generar hasta que sea único (loop simple)
        LOOP
            ref_code := UPPER(SUBSTRING(NEW.email FROM 1 FOR 3)) || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 4));
            IF NOT EXISTS (SELECT 1 FROM users WHERE referral_code = ref_code) THEN
                NEW.referral_code := ref_code;
                EXIT;
            END IF;
        END LOOP;
    END IF;

    -- B. Atribución (Si viene en el insert manual, se respeta. Si no, no hacemos nada aquí porque handle_new_user lo hace al inicio)
    -- Pero dado que users se llena via trigger handle_new_user, debemos modificar handle_new_user.
    -- Esta función corre BEFORE INSERT on users.
    
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_user_created_gen_code
    BEFORE INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION generate_referral_code_and_attribute();

-- OVERRIDE handle_new_user para capturar metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    referrer_id UUID;
    ref_code_used TEXT;
BEGIN
  -- Buscar si hubo código de referido en metadata
  ref_code_used := NEW.raw_user_meta_data->>'referral_code';
  
  IF ref_code_used IS NOT NULL THEN
     SELECT id INTO referrer_id FROM public.users WHERE referral_code = ref_code_used LIMIT 1;
  END IF;

  INSERT INTO public.users (id, email, full_name, avatar_url, referred_by, passenger_credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Sem Nombre'),
    NEW.raw_user_meta_data->>'avatar_url',
    referrer_id,
    CASE WHEN referrer_id IS NOT NULL THEN 1 ELSE 0 END -- 1 Crédito GRATIS si fue referido (Bono Bienvenida)
  );
  
  -- Si hubo referido, dar reward al pasajero? Ya se dio el crédito arriba.
  -- Y actualizar contador parcial del referrer (Bonus B2C) - Se hará asíncrono o con otro trigger.
  
  RETURN NEW;
END;
$$;


-- 5.2 Crear Billetera Automática para Conductores
CREATE OR REPLACE FUNCTION ensure_driver_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO wallets (user_id)
    VALUES (NEW.user_id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_driver_profile_created_wallet
    AFTER INSERT ON driver_profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_driver_wallet();

-- 5.3 Atribución de Referido (Cálculo de Comisiones B2B)
CREATE OR REPLACE FUNCTION process_b2b_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    referrer_user_id UUID;
    referrer_wallet_id UUID;
    referrer_driver_id UUID;
    current_level affiliate_level;
    commission_amount DECIMAL;
BEGIN
    -- Solo procesar si el status cambia a 'active' Y el origen es 'paid' (o equivalente a pago real)
    IF NEW.status = 'active' AND NEW.origin = 'paid' AND (OLD.status <> 'active' OR OLD.origin <> 'paid') THEN
        
        -- 1. Buscar quién refirió a este conductor
        SELECT u.referred_by INTO referrer_user_id
        FROM driver_profiles dp
        JOIN users u ON u.id = dp.user_id
        WHERE dp.id = NEW.driver_profile_id;
        
        -- Si no tiene referido, terminar
        IF referrer_user_id IS NULL THEN
            RETURN NEW;
        END IF;

        -- 2. Obtener datos del Referente (Wallet y Perfil de Conductor)
        SELECT w.id, dp.id, dp.affiliate_level 
        INTO referrer_wallet_id, referrer_driver_id, current_level
        FROM users u
        JOIN wallets w ON w.user_id = u.id
        JOIN driver_profiles dp ON dp.user_id = u.id
        WHERE u.id = referrer_user_id;

        -- Si el referente no es conductor o no tiene wallet, terminar
        IF referrer_wallet_id IS NULL OR referrer_driver_id IS NULL THEN
            RETURN NEW;
        END IF;

        -- 3. Calcular Monto
        CASE current_level
            WHEN 'bronze' THEN commission_amount := 80.00;
            WHEN 'silver' THEN commission_amount := 100.00;
            WHEN 'gold'   THEN commission_amount := 120.00;
            ELSE commission_amount := 80.00;
        END CASE;

        -- 4. Insertar Transacción
        INSERT INTO wallet_transactions (
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

        -- 5. Actualizar Saldo
        UPDATE wallets 
        SET balance_pending = balance_pending + commission_amount
        WHERE id = referrer_wallet_id;
        
        -- 6. Actualizar Contador de Referidos
        UPDATE driver_profiles
        SET referral_count = referral_count + 1
        WHERE id = referrer_driver_id;
        
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_membership_payment_commission
    AFTER UPDATE ON driver_memberships
    FOR EACH ROW
    EXECUTE FUNCTION process_b2b_commission();
