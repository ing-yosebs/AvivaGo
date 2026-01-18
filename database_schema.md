# Esquema de Base de Datos PostgreSQL: AvivaGo

Este diseño está optimizado para **Supabase (PostgreSQL)**. Se asume que la autenticación (Login/Sign-up) es manejada por `auth.users` de Supabase, y las tablas aquí descritas viven en el esquema `public`.

## 1. Diagrama Relacional (Texto)

*   `users` (Extiende `auth.users`)
*   `driver_profiles` (1:1 con `users`) -> Contiene la lógica de "Vitrina"
*   `vehicles` (N:1 con `driver_profiles`) -> Los autos del conductor
*   `service_tags` (Catálogo) & `driver_tags` (N:M) -> Especialidades (ej. "Mascotas", "Aeropuerto")
*   `unlocks` (Transacciones) -> Tabla pivote crítica: Usuario paga -> Ve datos de Conductor.
*   `reviews` (1:1 con `unlocks`) -> Solo se puede reseñar una transacción real.
*   `reports` -> Moderación.

---

## 2. Definición SQL (DDL)

```sql
-- ENUMS para estados y roles fijos
CREATE TYPE user_role_type AS ENUM ('admin', 'moderator', 'driver', 'client');
CREATE TYPE profile_status AS ENUM ('draft', 'pending_approval', 'active', 'hidden', 'suspended');
CREATE TYPE unlock_status AS ENUM ('completed', 'refunded', 'disputed');
CREATE TYPE report_status AS ENUM ('pending', 'investigating', 'resolved', 'dismissed');

-- 1. EXTENSIÓN DE USUARIOS (Public Profile)
-- Vinculada a auth.users de Supabase
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL, -- Copia de auth.users para querys rápidas
    full_name TEXT NOT NULL,
    phone_number TEXT,
    avatar_url TEXT,
    roles user_role_type[] DEFAULT '{client}', -- Array de roles
    is_banned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PERFIL DE CONDUCTOR (La Vitrina)
-- Solo existe si el user tiene rol 'driver'
CREATE TABLE driver_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Datos de presentación
    bio TEXT,
    profile_photo_url TEXT NOT NULL,
    cover_photo_url TEXT,
    city TEXT NOT NULL,
    service_radius_km INT DEFAULT 10,
    
    -- Datos de Contacto (PRIVADOS hasta desbloqueo)
    whatsapp_number TEXT NOT NULL,
    contact_email TEXT,

    -- Estado y Reputación
    status profile_status DEFAULT 'draft',
    average_rating NUMERIC(2,1) DEFAULT 0.0, -- Cache para no computar siempre
    total_reviews INT DEFAULT 0,
    total_unlocks INT DEFAULT 0, -- Popularidad
    ranking_score NUMERIC DEFAULT 0.0, -- (Rating * log(Unlock)) - Penalties
    
    -- Auditoría
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. VEHÍCULOS
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id) ON DELETE CASCADE,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    color TEXT,
    plate_number TEXT, -- Privado: solo admins ven esto
    photos_urls TEXT[], -- Array de URLs
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. ETIQUETAS / NICHOS (Tags)
CREATE TABLE service_tags (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL, -- Ej: "Silla Bebé", "Pet Friendly", "Blindado"
    icon_key TEXT, -- Referencia al icono frontend
    is_active BOOLEAN DEFAULT true
);

-- Tabla Pivote (Many-to-Many)
CREATE TABLE driver_service_tags (
    driver_profile_id UUID REFERENCES driver_profiles(id) ON DELETE CASCADE,
    tag_id INT REFERENCES service_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (driver_profile_id, tag_id)
);

-- 5. DESBLOQUEOS (Transacciones / Core Business)
CREATE TABLE unlocks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id), -- El cliente
    driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id), -- El conductor
    
    amount_paid DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_provider_id TEXT, -- Stripe Charge ID
    
    status unlock_status DEFAULT 'completed',
    valid_until TIMESTAMP WITH TIME ZONE, -- NULL = infinito
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricción: Un usuario desbloquea al mismo conductor una sola vez
    -- (Opcional, depende del modelo de negocio)
    UNIQUE(user_id, driver_profile_id)
);

-- 6. RESEÑAS (Reviews)
-- Solo se puede crear si existe un Unlock
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    unlock_id UUID UNIQUE NOT NULL REFERENCES unlocks(id) ON DELETE CASCADE, -- 1 Reseña por Desbloqueo
    
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT, -- Puede ser nulo si solo dejan estrellas
    
    -- Denormalización para queries rápidas
    driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id),
    reviewer_id UUID NOT NULL REFERENCES users(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. REPORTES (Moderación)
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id),
    reported_driver_profile_id UUID NOT NULL REFERENCES driver_profiles(id),
    
    reason TEXT NOT NULL, -- Enum o texto libre
    evidence_urls TEXT[], -- Screenshots
    
    status report_status DEFAULT 'pending',
    admin_notes TEXT,
    resolved_by UUID REFERENCES users(id), -- Admin ID
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 3. Índices Estratégicos (Performance)

Optimización para las consultas más frecuentes de la Web App.

1.  **Búsqueda Geográfica y Filtros de Vitrina:**
    ```sql
    CREATE INDEX idx_drivers_status_ranking ON driver_profiles(status, ranking_score DESC) WHERE status = 'active';
    CREATE INDEX idx_drivers_city ON driver_profiles(city) WHERE status = 'active';
    ```
2.  **Validación de Acceso (¿Ya pagó?):**
    ```sql
    CREATE INDEX idx_unlocks_lookup ON unlocks(user_id, driver_profile_id) WHERE status = 'completed';
    ```
3.  **Tags (Filtro por servicios):**
    ```sql
    CREATE INDEX idx_driver_tags_reverse ON driver_service_tags(tag_id, driver_profile_id);
    ```

---

## 4. Notas de Seguridad y Reglas

*   **Row Level Security (RLS):** Si usas Supabase, debes activar RLS en todas las tablas.
    *   `driver_profiles`: `whatsapp_number` debe tener una policy que SOLO permita lectura si `auth.uid() = user_id` (el dueño) O si existe un registro en `unlocks` donde `user_id = auth.uid()` y `driver_profile_id = profile.id`.
*   **Integridad de Reseñas:** La FK `unlock_id` con restricción `UNIQUE` garantiza matemáticamente que nadie puede dejar una reseña falsa sin haber pagado.
*   **Ranking:** El campo `ranking_score` debe actualizarse mediante un Trigger o Function cada vez que entra una nueva reseña, para evitar calcular promedios complejos síncronos en cada lectura de la Home.
