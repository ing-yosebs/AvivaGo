# Arquitectura Frontend: AvivaGo (Next.js App Router)

Esta arquitectura está diseñada para **Next.js 14+** con un enfoque pragmático: "Server First" para datos, "Client" para interacción.

## 1. Estructura de Directorios (`/app`)

Usaremos **Route Groups** `(...)` para organizar layouts lógica sin afectar la URL, y Carpetas Privadas `_components` para colocalizar componentes específicos de funcionalidad.

```
/app
├── (public)                   # Layout público (Navbar simple, Footer)
│   ├── page.tsx               # HOME: Landing + Listado Conductores (ISR/SSR)
│   ├── driver/[id]/page.tsx   # PERFIL PÚBLICO: Vista estática (ISR) con contacto bloqueado
│   └── auth/                  # Login/Register (Client Components con Supabase Auth UI)
│
├── (app)                      # Layout de Aplicación (Auth Required)
│   ├── layout.tsx             # Verifica sesión. Navbar con Avatar de usuario.
│   │
│   ├── dashboard/             # RUTA CLIENTE
│   │   └── page.tsx           # "Mis Desbloqueos" (Lista de contactos pagados)
│   │
│   └── driver-panel/          # RUTA CONDUCTOR (Protegida por Rol)
│       ├── layout.tsx         # Verifica rol 'driver'. Sidebar de gestión.
│       ├── page.tsx           # Stats y Toggle Visibilidad
│       └── profile/           # Edición de Perfil
│
├── api/                       # API Routes (Backend-for-Frontend)
│   ├── webhooks/stripe/       # Manejo de eventos de pago
│   └── revalidate/            # On-demand revalidation para actualizar perfiles
│
└── layout.tsx                 # Root Layout (Providers: Toaster, Analytics)
```

---

## 2. Server Components vs. Client Components

### Server Components (Default)
**Objetivo:** Fetching de datos directo a Supabase, SEO, Carga inicial rápida.
*   **Home (`/page.tsx`):** `await supabase.from('driver_profiles').select(...)`. Renderiza la lista inicial.
*   **Perfil (`/driver/[id]/page.tsx`):** Carga los datos públicos del conductor. Verifica en el servidor si el usuario actual YA desbloqueó este perfil para decidir qué mostrar (Server-side Toggle).

### Client Components (`'use client'`)
**Objetivo:** Interacción, Estado (useState), Browser APIs.
*   `DriverFilterBar`: Maneja el estado de los filtros (Ciudad, Tags) y actualiza la URL (`useRouter`, `useSearchParams`).
*   `UnlockButton`: Maneja el click -> Abre Modal Stripe -> Procesa pago -> Llama callback de éxito.
*   `ReviewForm`: Formulario interactivo con estrellas y validación.
*   `VisibilityToggle`: Switch en el panel de conductor que llama a `supabase.update()`.

---

## 3. Estrategia de Autenticación y Roles

### Middleware (`middleware.ts`)
El guardián global. Se ejecuta antes de cada request.
1.  **Actualiza Sesión:** `supabase.auth.getSession()`.
2.  **Protección de Rutas:**
    *   Si intenta entrar a `/(app)/*` sin sesión -> Redirect a `/auth/login`.
    *   Si intenta entrar a `/driver-panel/*` y `user.role !== 'driver'` -> Redirect a `/dashboard` (o 403).

### Contexto de Usuario
Aunque Supabase Auth funciona bien, crearemos un `UserProvider` (Client Context) ligero para tener acceso global a:
*   `user`: Objeto auth de Supabase.
*   `profile`: Datos de nuestro perfil (incluyendo rol y avatar).
*   `isLoading`: Para spinners globales.

---

## 4. Componentes Reutilizables (Design System)

Ubicados en `/components/ui` (genéricos) y `/components/avivago` (negocio).

### UI Base (Shadcn/UI + Tailwind)
*   `Button` (Primary, Ghost, Destructive)
*   `Card` (Contenedor estándar)
*   `Dialog` (Modales de pago)
*   `Badge` (Para Tags: "Mascotas", "WiFi")
*   `Avatar`

### Componentes de Negocio
*   `DriverCard`:
    *   Props: `driver: DriverProfile`.
    *   Muestra foto, nombre, estrellas, tags y botón "Ver Perfil".
*   `ContactReveal`:
    *   Props: `locked: boolean`, `price: number`, `contactInfo: ContactData`.
    *   Lógica: Si `locked`, muestra el botón "Desbloquear" y blur sobre el texto. Si `!locked`, muestra el teléfono real y botón WhatsApp.
*   `StarRating`:
    *   Props: `rating: number`, `readOnly: boolean`.
    *   Visualiza estrellas llenas/vacías.

---

## 5. Manejo de Datos (Supabase)

### Server-Side Fetching
En Server Components, instanciamos un cliente Supabase configurado para cookies.
```typescript
// app/page.tsx
const supabase = createClient();
const { data: drivers } = await supabase.from('driver_profiles').select('*, service_tags(*)');
```

### Server Actions (Mutaciones)
Para formularios (ej. Editar Perfil, Crear Reseña), usaremos **Server Actions**:
*   Progresiva mejora (funcionan sin JS a veces).
*   Revalidación automática de caché (`revalidatePath`).
*   Validación de datos con Zod en el servidor.

**Ejemplo:** `updateDriverProfile(formData: FormData)` -> Valida -> `supabase.update()` -> `revalidatePath('/driver-panel')`.

---

## 6. Resumen de Flujo Crítico (Desbloqueo)

1.  Usuario en `/driver/123` (Server Component).
2.  SC verifica en BD `unlocks` si existe relación `user <-> driver`.
3.  Pasa prop `isUnlocked={false}` al Client Component `ContactReveal`.
4.  Usuario click "Desbloquear". `ContactReveal` abre Stripe.
5.  Pago OK. Stripe Webhook actualiza BD.
6.  Usuario es redirigido o la página se refresca.
7.  SC vuelve a ejecutar, ahora ve el unlock en BD.
8.  Pasa prop `isUnlocked={true}`.
9.  Renderiza teléfono real.

Esta arquitectura separa claramente preocupaciones, aprovecha el SEO de Next.js para la vitrina pública y asegura la protección de datos sensibles en el servidor.
