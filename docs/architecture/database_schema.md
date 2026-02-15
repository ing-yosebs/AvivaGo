# Esquema de Base de Datos PostgreSQL: AvivaGo

Diseño optimizado para **Supabase (PostgreSQL)**.

## 1. Diagrama Relacional (Resumen)

*   `users`: Base de identidad.
*   `driver_profiles`: Perfil extendido del conductor (contiene `affiliate_level`, `is_visible`).
*   `driver_memberships`: Control de suscripción (Trial/Active). Reemplaza al modelo de "Unlocks".
*   `quote_requests`: Solicitudes de viaje de pasajeros.
*   `vehicles`: Flota del conductor.
*   `driver_services`: Configuración detallada de servicios (zonas, horarios).
*   `pending_payments`: Registro de intentos de pago (OXXO/SPEI).

---

## 2. Definición SQL (DDL Parcial)

```sql
-- ENUMS
CREATE TYPE user_role_type AS ENUM ('admin', 'driver', 'client');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'trial', 'cancelled');
CREATE TYPE affiliate_level_type AS ENUM ('bronze', 'silver', 'gold');

-- 1. USUARIOS
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE,
    full_name TEXT NOT NULL,
    roles user_role_type[] DEFAULT '{client}',
    referral_code TEXT UNIQUE, -- Para sistema de referidos
    referred_by TEXT, -- Código de quien lo invitó
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PERFIL CONDUCTOR
CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id),
    
    -- Estado
    is_visible BOOLEAN DEFAULT false, -- Toggle manual (requiere membresía)
    is_verified BOOLEAN DEFAULT false,
    
    -- Gamification
    affiliate_level affiliate_level_type DEFAULT 'bronze',
    
    -- Datos Públicos
    bio TEXT,
    profile_photo_url TEXT,
    city TEXT,
    
    -- Datos Contacto (Visibles si is_visible = true)
    whatsapp_number TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MEMBRESÍAS (Core Business)
CREATE TABLE driver_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID REFERENCES driver_profiles(id),
    
    status membership_status DEFAULT 'trial',
    plan_type TEXT, -- 'monthly', 'annual'
    
    starts_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    
    payment_provider_id TEXT, -- Stripe Subscription ID
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. SERVICIOS DETALLADOS
CREATE TABLE driver_services (
    driver_profile_id UUID PRIMARY KEY REFERENCES driver_profiles(id),
    preferred_zones TEXT[],
    languages TEXT[],
    work_schedule JSONB, -- { "mon": {"start": "08:00", "end": "18:00"} }
    payment_methods TEXT[],
    payment_link TEXT, -- Link propio del conductor (Paypal/Stripe)
    professional_questionnaire JSONB
);

-- 5. SOLICITUDES DE COTIZACIÓN
CREATE TABLE quote_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id), -- Pasajero
    
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    
    status TEXT DEFAULT 'open', -- open, accepted, cancelled
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. VEHÍCULOS
CREATE TABLE vehicles (
    id UUID PRIMARY KEY,
    driver_profile_id UUID REFERENCES driver_profiles(id),
    brand TEXT,
    model TEXT,
    year INT,
    photos_urls TEXT[],
    is_active BOOLEAN
);
```

## 3. Lógica de Seguridad (RLS)

*   **Visibilidad Pública:** Un `driver_profile` es legible por `public` si `is_visible` es `true` y el estado es `active`, `draft` o `pending_approval` ("Born Public").
*   **Control de Visibilidad:** El conductor solo puede poner `is_visible = true` si tiene una **Membresía Activa** (validado por Trigger o Policy).
*   **Datos Privados:** Tablas como `driver_memberships` o `pending_payments` solo son visibles por el propio usuario (`auth.uid() = user_id`) o Admins.

## 4. Índices
*   Índice en `driver_profiles(city)` y `driver_services(preferred_zones)` para búsqueda rápida en el directorio.
*   Índice en `users(referral_code)` para atribución rápida de referidos.
