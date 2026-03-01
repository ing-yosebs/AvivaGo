# Visión General Técnica de AvivaGo

Este documento proporciona una descripción técnica detallada de la plataforma **AvivaGo**, basada en el análisis de su código fuente actual y esquema de base de datos.

## 1. Introducción
AvivaGo es una plataforma web tipo *marketplace* que conecta a **Conductores Profesionales** con **Pasajeros**. A diferencia de las apps de transporte tradicionales (Uber/DiDi), AvivaGo opera bajo un modelo de suscripción y acceso directo ("desbloqueo") de información de contacto, permitiendo a los conductores construir su propia cartera de clientes y quedarse con el 100% de sus ganancias por viaje.

## 2. Stack Tecnológico

La aplicación está construida sobre un stack moderno y escalable:

*   **Frontend**: [Next.js 16](https://nextjs.org/) (App Router, Server Components).
*   **Lenguaje**: TypeScript.
*   **Estilos**: Tailwind CSS + Radix UI (para componentes de UI accesibles).
*   **Generación de Assets**: `html2canvas` (para crear flyers/tarjetas en el navegador).
*   **Base de Datos**: PostgreSQL (alojado en [Supabase](https://supabase.com/)).
*   **Autenticación**: Supabase Auth (Integrado con tabla `public.users`).
*   **Pagos**: Stripe (Suscripciones para conductores).
*   **APIs Externas**: Google Maps & Routes API V2 (Geocodificación, Rutas y Peajes dinámicos).
*   **Infraestructura**: Despliegue compatible con Vercel/Edge Functions.

## 3. Arquitectura del Proyecto

El proyecto sigue la estructura del **App Router** de Next.js, separando lógicamente las vistas públicas de las privadas.

### Estructura de Directorios Clave (`app/`)
*   **(marketing)**: Rutas públicas de la página de aterrizaje (Landing Page).
*   **(panel)**: Área privada para usuarios autenticados (Dashboard). Contiene:
    *   `dashboard`: Vista principal con métricas.
    *   `perfil`: Gestión de perfil de usuario/conductor.
    *   `solicitudes` / `mis-solicitudes`: Gestión de cotizaciones de viajes.
    *   `billetera`: Visualización de ganancias o créditos.
    *   `affiliates`: Sistema de referidos.
*   **admin**: Panel de administración para moderación.
*   **auth**: Rutas de autenticación (Login, Callback, Reset Password).
*   **api**: Endpoints de backend (Webhooks de Stripe, etc.).

## 4. Modelo de Datos (Base de Datos)

El esquema de base de datos (`supabase_schema.sql`) está diseñado alrededor de dos actores principales: Usuarios y Conductores.

### Entidades Principales
1.  **`users`**: Extensión de `auth.users`. Almacena datos básicos (nombre, email, rol).
    *   *Roles*: `admin`, `moderator`, `driver`, `client`.
2.  **`driver_profiles`**: Perfil extendido para conductores.
    *   Contiene: Bio, fotos, ciudad, radio de servicio, estado (`approval`, `active`), calificaciones.
    *   *RLS*: Protegido para que solo usuarios con "Unlock" pagado puedan ver datos de contacto sensibles.
3.  **`vehicles`**: Información de los vehículos asociados a un conductor.
4.  **`unlocks`**: Representa la transacción donde un pasajero paga (o usa créditos) para obtener los datos de contacto de un conductor.
5.  **`driver_memberships`**: Controla el estado de suscripción del conductor (Trial, Activo, Vencido) vinculado a Stripe.
6.  **`reviews`**: Sistema de calificación vinculado a un `unlock` completado.

## 5. Módulos y Funcionalidades

### 5.1 Autenticación y Onboarding
*   Registro diferenciado para Pasajeros y Conductores.
*   **Triggers de BD**:
    *   Al crear un usuario, se genera automáticamente una entrada en `public.users`.
    *   Si el rol es `driver`, se crea un `driver_profile` en estado `draft` y se asigna una prueba gratuita (`trial`) de 14 días automáticamente.

### 5.2 Sistema de Suscripción (Conductores)
*   Los conductores deben tener una membresía activa para ser visibles en las búsquedas.
*   Integración con **Stripe** para cobros recurrentes.
*   Webhooks manejan la renovación y expiración de membresías en tiempo real.

### 5.3 Sistema de Kit de Marketing (Conductores)
*   **Generación de Assets**: Los conductores pueden descargar Flyers, Tarjetas y Stickers personalizados con su QR y código de referido.
*   **Solicitud de Kit Físico**:
    *   Formulario para pedir el envío de materiales impresos.
    *   Flujo de aprobación manual: Admin recibe solicitud -> Cotiza envío -> Conductor Paga (Off-platform por ahora) -> Admin envía.
    *   Requiere membresía activa (Nivel Plata o superior).

### 5.4 Marketplace y "Unlocks"
*   Los pasajeros buscan conductores por ciudad o geolocalización.
*   Para contactar, el pasajero realiza un **"Unlock"** (Desbloqueo).
*   Esto revela el WhatsApp y teléfono del conductor.

*   Los conductores reciben y pueden aceptar/rechazar estas solicitudes.

### 5.6 Calculadora Inteligente de Costos y Rentabilidad
*   **Internacionalización**: Detección dinámica de país (`country_code`) desde el perfil del conductor para ajustar moneda (MXN, COP), unidades (Litros, Galones) y centro del mapa.
*   **Integración de Peajes**: Consulta a Google Routes API V2 para obtener costos de casetas/peajes según la ruta y paradas intermedias.
*   **Sistema de Cuotas (Monthly Quota)**: 
    *   **Usuarios Free**: 4 usos de cortesía por mes.
    *   **Usuarios Premium**: Cuota base de 30 usos, escalable hasta **ilimitado** según el nivel de afiliados (`Gold`).
    *   **Persistencia**: Seguimiento de uso almacenado en la tabla `calculator_usage` vinculada al ID del usuario y mes/año.

### 5.6 Sistema de Afiliados y Billetera (Wallet)
*   **Códigos de Referido**: Se generan automáticamente para cada usuario al registrarse.
*   **Niveles de Afiliado**: Los conductores tienen niveles (`Bronze`, `Silver`, `Gold`) que determinan sus comisiones.
*   **Billetera (`wallets`)**: Gestión financiera interna para conductores.
    *   Soporta estados de saldo: `pending` (retenido 15 días) y `available`.
    *   **Lógica de Comisión**: Cuando un conductor referido paga su membresía, el "Padrino" recibe una comisión automática.
*   **B2C**: Los pasajeros ganan créditos por invitar a otros pasajeros.

## 6. Seguridad (RLS)
El sistema utiliza **Row Level Security (RLS)** de Postgres de forma intensiva:
*   Los perfiles de conductores son visibles públicamente si `is_visible` es true y su estatus es `active`, `draft` o `pending_approval`.
*   Solo perfiles `active` con membresía vigente son indexables por motores de búsqueda.
*   La información de contacto es privada hasta que existe una relación de negocio.
