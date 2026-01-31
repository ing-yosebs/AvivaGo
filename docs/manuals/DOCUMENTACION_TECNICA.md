# Documentación Técnica y Arquitectura: AvivaGo

Este documento resume la infraestructura, el stack tecnológico y los componentes que componen el ecosistema de **AvivaGo**.

## 1. Gestión y Ciclo de Vida del Desarrollo
*   **Repositorio Central:** [GitHub](https://github.com/) - Control de versiones, gestión de ramas y despliegue continuo.
*   **Asistente de Desarrollo:** **Antigravity (Google DeepMind)** - IA encargada de la arquitectura, generación de código y resolución de errores.
*   **Automatización:** Scripts personalizados en `/scripts` para simulación de pagos (Stripe) y validación de lógica de comisiones.

## 2. Infraestructura Cloud (Serverless)
*   **[Supabase](https://supabase.com/):** Plataforma integral de Backend-as-a-Service.
    *   **PostgreSQL:** Base de datos relacional robusta.
    *   **Auth:** Gestión de usuarios y sesiones vía JWT.
    *   **Storage:** Almacenamiento de fotos de perfil y documentos.
    *   **RLS (Row Level Security):** Políticas de seguridad a nivel de base de datos.
*   **[Vercel](https://vercel.com/):** Hosting optimizado para Next.js con despliegue automático desde GitHub.
*   **[Stripe](https://stripe.com/):** Procesamiento de pagos, suscripciones y gestión de Webhooks.

## 3. Stack Tecnológico (Core)
*   **Framework:** [Next.js](https://nextjs.org/) (Versión 14/15 con App Router) - Optimizado para SEO mediante Server Side Rendering (SSR).
*   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) - Tipado estático para un código más seguro y predecible.
*   **Interfaz:** [React](https://react.dev/) - Biblioteca para componentes de UI reactivos.
*   **Estilos:** [Tailwind CSS](https://tailwindcss.com/) - Diseño responsivo y moderno mediante utilidades.
*   **Componentes UI:** [Shadcn/UI](https://ui.shadcn.com/) - Set de componentes premium y accesibles.

## 4. Capa de Datos y Seguridad
*   **Modelado SQL:** Uso de migraciones `.sql` para definir esquemas, tablas y relaciones de forma profesional.
*   **Seguridad:** Implementación de políticas RLS para garantizar que los datos sensibles (teléfonos, ingresos) solo sean accesibles por usuarios autorizados.

## 5. Integraciones Externas (APIs)
*   **Google Maps API:** Geolocalización, mapas interactivos y búsqueda por zonas de cobertura.
*   **Resend:** Motor de envío de correos electrónicos transaccionales (bienvenida, recibos de pago).
*   **Stripe Webhooks:** Sistema de escucha que sincroniza el estado de los pagos con la base de datos de Supabase.

## 6. Componentes Maestros del Negocio
El sistema se organiza en componentes de React altamente especializados:
1.  **`DriverBrowser`:** Buscador con filtros dinámicos (zona, idioma, servicios).
2.  **`ProfileView`:** Vista detallada del conductor con lógica de "contacto bloqueado/desbloqueado".
3.  **`OnboardingForm`:** Flujo guiado para el registro completo y profesional del conductor.
4.  **`DashboardSidebar`:** Navegación centralizada para gestión de perfil y billetera.
5.  **`ReviewThread`:** Sistema de reputación, valoraciones y respuestas entre usuarios.

---
## 7. Dominio y Configuración
*   **Dominio Principal:** `avivago.mx`
*   **Subdominio App (Correos):** `app.avivago.mx`
*   **Configuración:** El dominio se utiliza como base para la generación de metadatos (SEO), enlaces en correos electrónicos y redirecciones de Stripe. Las variables de entorno `NEXT_PUBLIC_BASE_URL` deben apuntar a este dominio en producción.

---
*Última actualización: 26 de enero, 2026*
