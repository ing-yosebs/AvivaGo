-- Crear tabla de auditoría para consentiientos
CREATE TABLE IF NOT EXISTS public.user_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Control de Versiones
    privacy_notice_version TEXT NOT NULL,
    terms_version TEXT NOT NULL,
    
    -- Metadatos de Auditoría
    accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    acceptance_method TEXT NOT NULL,
    consent_text TEXT NOT NULL,
    
    -- Metadatos Técnicos
    ip_address TEXT,
    user_agent TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_user_consents_user_id ON public.user_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_user_consents_versions ON public.user_consents(privacy_notice_version, terms_version);

-- Habilitar RLS
ALTER TABLE public.user_consents ENABLE ROW LEVEL SECURITY;

-- Política de lectura: usuarios ven sus propios consentimientos
CREATE POLICY "Users can view own consents" ON public.user_consents
    FOR SELECT
    USING (auth.uid() = user_id);

-- Política de inserción: solo service_role (backend) puede insertar
-- Esto es implícito porque no creamos política FOR INSERT para usuarios anónimos/autenticados
-- y el service_role siempre tiene acceso total (bypass RLS)
