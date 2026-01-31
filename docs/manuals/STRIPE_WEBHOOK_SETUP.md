# Guía de Configuración de Webhooks de Stripe

Para que AvivaGo detecte automáticamente las renovaciones de membresía, debes conectar Stripe con tu servidor siguiendo estos pasos.

## Paso 1: Configurar en Stripe Dashboard

1. Inicia sesión en tu cuenta de **Stripe**.
2. Ve a la sección **Desarrolladores** (arriba a la derecha) -> Pestaña **Webhooks**.
3. Haz clic en el botón **"Agregar punto de conexión"** (Add endpoint).

### Datos del Punto de Conexión:
*   **URL del punto de conexión:**
    *   Para Producción: `https://avivago.mx/api/webhooks/stripe` (o tu dominio `.vercel.app`)
    *   *Nota: Para probar en local, necesitarás usar el Stripe CLI, pero para producción usa tu URL real.*
*   **Descripción:** Renovaciones AvivaGo (Opcional)
*   **Escuchar eventos en:** Selecciona **"Seleccionar eventos"**.

### Eventos Requeridos (Busca y marca estos 3):
1.  `invoice.payment_succeeded` (Para renovar la fecha de vencimiento)
2.  `invoice.payment_failed` (Para bloquear si falla el pago)
3.  `customer.subscription.deleted` (Para cancelar la membresía)

Haz clic en **"Agregar punto de conexión"**.

## Paso 2: Obtener el Secreto (Signing Secret)

1. Una vez creado, verás la pantalla de detalles del webhook.
2. Busca la sección **"Secreto de firma"** (Signing secret).
3. Haz clic en **"Revelar"**.
4. Copia el código que empieza con `whsec_...`.

## Paso 3: Configurar Variable de Entorno

### En Vercel (Producción)
1. Ve a tu proyecto en **Vercel**.
2. Entra a **Settings** -> **Environment Variables**.
3. Agrega una nueva variable:
    *   **Key:** `STRIPE_WEBHOOK_SECRET`
    *   **Value:** (Pega el código `whsec_...` que copiaste)
4. Haz clic en **Save**.
5. **IMPORTANTE:** Debes hacer un **Redeploy** (o esperar al siguiente deploy) para que el servidor tome el cambio.

### En Local (Para desarrollo)
1. Abre tu archivo `.env.local`.
2. Agrega la línea al final:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_tu_codigo_secreto_aqui
   ```
3. Reinicia tu servidor de desarrollo (`npm run dev`).

---
**¡Listo!** Ahora Stripe avisará automáticamente a tu base de datos cada vez que ocurra un evento de suscripción.
