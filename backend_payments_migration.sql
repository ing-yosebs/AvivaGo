
-- MIGRACIÓN: MÉTODOS DE PAGO
-- Agrega soporte para que los conductores definan sus métodos de cobro.

DO $$ 
BEGIN
    -- 1. Asegurar que la tabla driver_services existe (por si acaso no estaba en scripts previos)
    CREATE TABLE IF NOT EXISTS public.driver_services (
        driver_profile_id UUID PRIMARY KEY REFERENCES public.driver_profiles(id) ON DELETE CASCADE,
        work_schedule JSONB DEFAULT '{}',
        preferred_zones TEXT[] DEFAULT '{}',
        languages TEXT[] DEFAULT '{}',
        indigenous_languages TEXT[] DEFAULT '{}',
        professional_questionnaire JSONB DEFAULT '{}',
        personal_bio TEXT,
        transport_platforms TEXT[] DEFAULT '{}',
        knows_sign_language BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
EXCEPTION WHEN duplicate_table THEN
    NULL;
END $$;

-- 2. Agregar columnas de pagos
ALTER TABLE public.driver_services
ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS payment_link TEXT;

-- 3. Crear índice para filtrado rápido (opcional, por si queremos filtrar "solo acepta tarjeta")
CREATE INDEX IF NOT EXISTS idx_driver_services_payment ON public.driver_services USING GIN (payment_methods);
