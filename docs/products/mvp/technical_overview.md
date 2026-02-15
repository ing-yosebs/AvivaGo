# Visión General Técnica de AvivaGo

## 1. Introducción
AvivaGo es una plataforma SaaS + Marketplace para transporte privado.
*   **Modelo:** SaaS para conductores (Pagan suscripción por herramientas y visibilidad).
*   **Marketplace:** Gratuito para pasajeros (Encuentran y contactan conductores seguros).

## 2. Stack Tecnológico

*   **Frontend**: Next.js 14+ (App Router).
*   **Estilos**: Tailwind CSS, Lucide Icons.
*   **Backend / DB**: Supabase (PostgreSQL, Auth, Storage, Edge Functions).
*   **Pagos**: Stripe (Suscripciones) y Gestión Manual (OXXO/SPEI).
*   **Marketing Gen**: `html2canvas` para generación de assets visuales en el cliente.

## 3. Arquitectura del Proyecto

### Módulos Principales (`/app/(panel)`)
*   **`perfil`**: El corazón de la app para el conductor.
    *   Gestión integral mediante Tabs (`page.tsx` con query params).
    *   Sub-módulos: `MarketingSection`, `ServicesSection`, `PaymentsSection`.
*   **`solicitudes`**: Sistema de marketplace inverso (Pasajeros piden, Conductores aplican).
*   **`invitados`**: Sistema de Gestión de Referidos y Niveles (Gamification).

## 4. Modelo de Datos (Evolución)

El sistema ha evolucionado de un modelo de "Unlocks" a uno de **Membresías**:

1.  **`driver_profiles`**: Gestiona la "Vitrina". Tiene flags como `is_visible` (controlado por membresía) y `affiliate_level`.
2.  **`driver_memberships`**: Controla el acceso. Si está activa, el conductor puede aparecer en búsquedas.
3.  **`quote_requests`**: Permite a pasajeros postular viajes.
4.  **`driver_services`**: Almacena configuración compleja (horarios JSON, arrays de zonas).

## 5. Funcionalidades Clave

### 5.1 Sistema de Marketing (Previamente "Visibilidad")
Los conductores tienen acceso a un **Kit de Marketing** que genera dinámicamente:
*   Tarjetas de presentación con QR personal.
*   Flyers para historias de redes sociales.
*   Stickers para el auto.
Este módulo reside en `MarketingSection` y es un beneficio clave de la suscripción.

### 5.2 Niveles de Afiliado (Gamification)
El sistema rastrea referidos (`users.referral_code`).
*   **Bronce/Plata/Oro**: Basado en conteo de referidos.
*   Desbloquea beneficios visuales y acceso a kits físicos.
*   Lógica implementada en Frontend (`useProfileData`) y BD.

### 5.3 Control de Visibilidad
*   Un conductor solo puede activar su visibilidad si tiene membresía activa.
*   Si la membresía vence, un CRON job o verificación en login desactiva la visibilidad automáticamente.

## 6. Seguridad
*   **RLS (Row Level Security)**: Protege los datos personales de conductores.
*   **Verificación**: Perfiles requieren aprobación o verificación de documentos para obtener el badge de "Verificado".
