# Arquitectura Frontend: AvivaGo (Next.js App Router)

Arquitectura basada en **Next.js 14+** (App Router) y **Supabase**.

## 1. Estructura de Directorios (`/app`)

```
/app
├── (public)
│   ├── page.tsx               # LANDING: Buscador + Listado (Visible para todos)
│   ├── conductor/[id]/        # PERFIL PÚBLICO: (SEO Friendly, Manejo robusto de errores 404/Soft 404)
│   ├── auth/                  # Login/Register
│   └── legales/               # Términos, Privacidad
│
├── (panel)                    # DASHBOARD (Layout Protegido)
│   ├── layout.tsx             # Sidebar + Header
│   ├── dashboard/             # Vista Principal
│   │
│   ├── perfil/                # GESTIÓN DE PERFIL (Página Única con Tabs)
│   │   ├── page.tsx           # Orquestador de Tabs
│   │   └── components/
│   │       ├── PersonalDataSection.tsx
│   │       ├── ServicesSection.tsx   # Configuración de servicios/visibilidad
│   │       ├── MarketingSection.tsx  # (Antes Visibility) Kit de Marketing
│   │       ├── VehiclesSection.tsx
│   │       └── PaymentsSection.tsx   # Gestión de Membresía
│   │
│   ├── solicitudes/           # GESTIÓN DE COTIZACIONES
│   │   └── page.tsx           # Inox de solicitudes recibidas/enviadas
│   │
│   └── invitados/             # SISTEMA DE REFERIDOS
│
├── admin/                     # PANEL ADMINISTRADOR
│   ├── users/
│   └── memberships/
│
└── api/                       # Webhooks (Stripe)
```

## 2. Componentes Clave

### Perfil y Configuración (`/perfil`)
Usa un patrón de **Tabs** controlado por URL (`?tab=marketing`) para gestionar la complejidad:
*   **`MarketingSection`:** Muestra el `DriverMarketingKit` (QR, Flyers) y controla la visibilidad pública.
*   **`ServicesSection`:** Configura zonas, horarios y cuestionarios profesionales.
*   **`PaymentsSection`:** Muestra estado de suscripción y flujo de compra (Stripe/OXXO).

### Marketing Kit (`DriverMarketingKit`)
Componente complejo que genera imágenes dinámicas:
*   Usa `html2canvas` para renderizar flyers con la foto y QR del conductor.
*   Permite descargar recursos para compartir en redes sociales (TikTok/Facebook Ads).

### Sidebar (`DashboardSidebar`)
Navegación dinámica según rol (Conductor vs Pasajero).
*   Enlace directo a **"Marketing"** (antes visibilidad).
*   Gestión de "Mis Solicitudes".

## 3. Estado y Datos

*   **Autenticación:** Supabase Auth + Middleware.
*   **Persistencia:** Hooks como `useProfileData` centralizan el fetching de `users` y `driver_profiles`.
*   **Gamification:** El frontend calcula y muestra el nivel del conductor (Bronce, Plata, Oro) basado en datos de referidos.

## 4. Flujos Críticos

### Flujo de Suscripción
1.  Conductor entra a `PaymentsSection`.
2.  Selecciona Plan.
3.  Procesa pago (Stripe Element o Referencia OXXO).
4.  Webhook actualiza `driver_memberships`.
5.  Frontend actualiza estado -> Habilita toggle `is_visible` en `ServicesSection`.

### Flujo de Visibilidad/Marketing
1.  Conductor va a tab **Marketing**.
2.  Si tiene membresía -> Ve su QR y herramientas.
3.  Descarga Flyer.
4.  Comparte en Redes Sociales para atraer tráfico a su perfil público.
