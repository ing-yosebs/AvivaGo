-- IMPLEMENTACIÓN DEL SISTEMA DE MEMBRESÍAS Y VISIBILIDAD DE CONDUCTORES (Supabase Compatible)

-- 1. PREPARACIÓN: Ajustes a tablas existentes
-- Agregamos 'is_visible' para cumplir con el requerimiento de toggle manual (Visible/Oculto)
ALTER TABLE driver_profiles 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- 2. ENUMS Y TABLA DE MEMBRESÍAS
CREATE TYPE membership_origin AS ENUM ('trial', 'paid', 'admin_grant');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'canceled', 'past_due');

CREATE TABLE driver_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    
    origin membership_origin NOT NULL DEFAULT 'trial',
    status membership_status NOT NULL DEFAULT 'active',
    
    stripe_subscription_id TEXT, -- Nullable, se llena cuando pagan
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    
    granted_by UUID REFERENCES users(id), -- Auditoría si fue un admin
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción: Un perfil solo tiene una membresía (historial se maneja en otra tabla si fuera necesario, o se recicla esta)
    CONSTRAINT uniq_driver_membership UNIQUE (driver_profile_id)
);

-- Indices
CREATE INDEX idx_membership_driver ON driver_memberships(driver_profile_id);
CREATE INDEX idx_membership_status_expiry ON driver_memberships(status, expires_at);

-- 3. FUNCIÓN DE VERIFICACIÓN (Core Logic)
-- IMPORTANTE: SECURITY DEFINER permite que esta función lea la tabla memberships
-- incluso si el usuario anónimo (public) no tiene acceso directo a ella.
CREATE OR REPLACE FUNCTION is_driver_active(check_profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public -- Buena práctica de seguridad
AS $$
    SELECT EXISTS (
        SELECT 1 
        FROM driver_memberships
        WHERE driver_profile_id = check_profile_id
          AND status = 'active'
          AND expires_at > NOW()
    );
$$;

-- 4. TRIGGER: Trial Automático
CREATE OR REPLACE FUNCTION handle_new_driver_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO driver_memberships (driver_profile_id, origin, status, expires_at)
    VALUES (
        NEW.id, 
        'trial', 
        'active', 
        NOW() + INTERVAL '14 days' -- Configurable: duración del trial
    );
    RETURN NEW;
END;
$$;

-- Se ejecuta cada vez que un usuario crea su perfil de conductor
CREATE TRIGGER on_driver_profile_created
    AFTER INSERT ON driver_profiles
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_driver_trial();

-- 5. FUNCIÓN DE ADMINISTRACIÓN (Extensión Manual)
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
    -- Verificación de Rol (Asumiendo que auth.uid() es el admin)
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = auth.uid() 
        AND 'admin' = ANY(roles)
    ) THEN
        RAISE EXCEPTION 'Access Denied: Only admins can extend memberships';
    END IF;

    -- Upsert lógica (Actualiza si existe, sino error porque debería existir por el trigger)
    UPDATE driver_memberships
    SET 
        origin = 'admin_grant',
        status = 'active',
        expires_at = new_expiry,
        granted_by = auth.uid(),
        notes = admin_notes,
        updated_at = NOW()
    WHERE driver_profile_id = target_profile_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Membership not found for this driver';
    END IF;
END;
$$;

-- 6. POLÍTICAS DE SEGURIDAD (RLS)

-- Habilitar RLS
ALTER TABLE driver_memberships ENABLE ROW LEVEL SECURITY;

-- Política A: Driver ve su propia membresía (para saber cuándo caduca)
CREATE POLICY "Drivers view own membership" 
ON driver_memberships 
FOR SELECT 
USING (
    auth.uid() = (
        SELECT user_id FROM driver_profiles WHERE id = driver_profile_id
    )
);

-- Política B: Admins ven y editan todo
CREATE POLICY "Admins full access memberships" 
ON driver_memberships 
FOR ALL 
USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND 'admin' = ANY(roles))
);

-- 7. ACTUALIZACIÓN RLS EN PERFILES (La parte crítica de visibilidad)

-- Primero, aseguramos RLS en driver_profiles
ALTER TABLE driver_profiles ENABLE ROW LEVEL SECURITY;

-- Política de VISIBILIDAD PÚBLICA (Vitrina)
-- Combina: Status interno (aprobado/draft) + Toggle manual (is_visible) + Membresía válida
-- Nota: Esta política reemplaza o se suma a las existentes.
CREATE POLICY "Public profiles visible ONLY if active and paid" 
ON driver_profiles 
FOR SELECT 
USING (
    status = 'active'         -- Perfil aprobado por admin
    AND is_visible = true     -- Conductor no activó "Modo oculto"
    AND is_driver_active(id)  -- Tiene membresía válida (Trial o Pago)
);

-- Política de EDICIÓN (El dueño puede ver y editar su perfil incluso si expiró)
CREATE POLICY "Drivers manage own profile regardless of membership"
ON driver_profiles
FOR ALL
USING (
    auth.uid() = user_id
);
