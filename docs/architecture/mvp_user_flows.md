# Diseño de Producto: Flujos de Usuario y Pantallas MVP (AvivaGo)

Este documento define la experiencia de usuario mínima viable para validar el modelo de negocio "Desbloqueo de Contacto".

## 1. Filosofía de Diseño: "Menos es Más Confianza"
Como no gestionamos el viaje, la UI debe enfocarse en transmitir **transparencia** y **calidad** en los perfiles. El usuario paga por *información*, no por transporte inmediato.

---

## 2. Inventario de Pantallas (Sitemap MVP)

### Público (Visitante)
1.  **Home / Directorio (Landing):**
    *   Header con búsqueda y filtros (Ciudad, Tipo Vehículo).
    *   Grid infinita de "Tarjetas de Conductor".
    *   Hero section simple: "Encuentra conductores verificados, viaja seguro".
2.  **Detalle de Perfil (Vista Pública):**
    *   Fotos del conductor y auto (alta calidad).
    *   Bio, Zonas de servicio, Etiquetas (Mascotas, AC).
    *   **Blur/Candado:** Sobre el teléfono y WhatsApp.
    *   **CTA Flotante:** "Desbloquear Contacto por $X".
3.  **Auth:** Login/Register (Email Magic Link o Google).

### Cliente (Usuario Logueado)
4.  **Checkout Modal:** Pasarela de pago simplificada (Stripe Elements).
5.  **Detalle de Perfil (Vista Desbloqueada):**
    *   Igual a la pública, pero sin candados.
    *   Botón enorme: **"Abrir en WhatsApp"** o "Llamar".
    *   Botón secundario: **"Escribir Reseña"** (se activa 24h después).
6.  **Mis Desbloqueos (Historial):**
    *   Lista de conductores contactados para acceso rápido futuro.

### Conductor
7.  **Onboarding Conductor (Wizard):**
    *   Paso 1: Datos Personales.
    *   Paso 2: Datos del Auto + Fotos.
    *   Paso 3: Zonas y Bio.
    *   Estado: "Pendiente de Aprobación".
8.  **Mi Perfil (Dashboard):**
    *   Vista previa de su propia ficha.
    *   Toggle simple: **"Disponible" / "Oculto"** (Modo vacaciones).
    *   Estadísticas simples: "Veces desbloqueado este mes".

### Admin
9.  **Admin Dashboard (Retool o Tabla Simple):**
    *   Lista "Pendientes de Aprobación" (Aprobar/Rechazar).
    *   Lista de Reportes.

---

## 3. Flujos de Usuario (User Journeys)

### A. Flujo del Cliente: "La Búsqueda de Confianza"
**Objetivo:** Encontrar a alguien seguro para un viaje recurrente (ej. llevar hijos al colegio).

1.  **Discovery:** Entra al Home. Filtra por "Silla de bebé" y su barrio.
2.  **Evaluación:** Ve 3 perfiles. Le gusta "Juan P." porque tiene 40 reseñas y auto nuevo.
3.  **Intención:** Hace clic en "Contactar a Juan". El sistema pide Login.
4.  **Auth:** Se loguea con Google en 1 clic.
5.  **Conversión:** Vuelve a la ficha. Clic en "Desbloquear ($2.00)". Aparece pop-up de tarjeta. Paga.
6.  **Valor:** El pop-up cierra. El botón dice "WhatsApp: +57 300...".
7.  **Off-boarding:** Hace clic, se abre WhatsApp. **Fin del flujo en AvivaGo.**

### B. Flujo del Conductor: "Montar el Puesto"
**Objetivo:** Empezar a recibir clientes directos sin comisiones absurdas.

1.  **Registro:** Clic en "Soy Conductor".
2.  **Setup:** Sube foto de la licencia, foto del auto limpio, escribe "Soy amable y puntual".
3.  **Espera:** Ve pantalla "Tu perfil está en revisión".
4.  **Activación:** Recibe email "Estás aprobado".
5.  **Operación:** Entra a su dashboard. Se asegura que el toggle "Visible" esté activo. Espera mensajes en su WhatsApp personal.

---

## 4. Qué PANTALLAS NO EXISTEN (Anti-Roadmap MVP)

Aunque parezcan obvias, estas funcionalidades **matan** el lanzamiento de un MVP ágil:

*   ❌ **Chat Interno:** Cero desarrollo. Todo ocurre en WhatsApp. Es donde la gente ya está.
*   ❌ **Mapa en Tiempo Real (Uber style):** No hay seguimiento GPS. No es necesario para "acordar" un viaje programado.
*   ❌ **Billetera Virtual / Saldo:** AvivaGo no toca el dinero del viaje. Solo cobra el desbloqueo.
*   ❌ **Calculadora de Tarifas:** El precio del viaje se negocia en WhatsApp. AvivaGo no sugiere precios (evita problemas legales iniciales).
*   ❌ **Sistema de Disputas de Viaje:** Si el conductor llega tarde, se arreglan entre ellos o se deja una mala Review. La plataforma no arbitra el servicio físico.

## 5. Conclusión de Diseño
Este MVP es esencialmente un **Directorio Premium con Paywall**. La complejidad técnica es bajísima (CRUDs + Stripe), lo que permite invertir todo el esfuerzo en **Verificación de Identidad** y **Calidad Visual**, que son los verdaderos drivers de confianza.
