# Guía para Validación de Teléfono en Producción (WhatsApp Cloud API)

Para dejar el ambiente de pruebas (Sandbox) y validar teléfonos reales sin restricciones, es necesario configurar una **Línea de Producción** en Meta.

## Pasos en Meta Business Manager

### 1. Agregar un Número Real
1. Ve a [developers.facebook.com](https://developers.facebook.com) > *Mis Apps* > *AvivaGo* (o tu app).
2. En el menú lateral: **WhatsApp** > **Configuración de la API**.
3. Baja a la sección **"Paso 5: Agrega un número de teléfono"**.
4. Haz clic en **Agregar número de teléfono**.
5. Sigue los pasos para verificar un número real (recibirás un SMS/Llamada).
   - *Nota: Este número no puede estar registrado actualmente en WhatsApp personal ni Business App en un celular. Si lo usas, debes eliminar la cuenta desde la app primero.*
6. Una vez verificado, obtendrás un nuevo **Identificador de número de teléfono** (Phone ID).

### 2. Crear una Plantilla de Mensaje (Template)
En producción, NO SE PUEDE enviar texto libre como primer mensaje fuera de la ventana de 24 horas. Debes usar una **Plantilla**.

1. Ve al [Administrador de WhatsApp](https://business.facebook.com/wa/manage/message-templates/).
2. Haz clic en **Crear plantilla**.
3. Configuración:
   - **Categoría**: `Utilidad` (o `Autenticación` si prefieres, pero Utilidad es más rápido de aprobar).
   - **Nombre**: `avivago_otp` (Debe coincidir exactamente con el código).
   - **Idioma**: `Español (México)` (`es_MX`).
4. **Contenido**:
   - En el cuerpo del mensaje escribe:
     ```text
     Tu código de verificación AvivaGo es: {{1}}
     ```
   - (El `{{1}}` es la variable donde insertaremos el código).
5. Envía la plantilla a revisión. (Suele aprobarse en segundos o minutos).

### 3. Obtener un Token Permanente (System User)
El token temporal de 24 horas NO SIRVE para producción.

1. Ve a la [Configuración del Negocio](https://business.facebook.com/settings/) de Meta.
2. Menú **Usuarios** > **Usuarios del sistema**.
3. Si no tienes uno, haz clic en **Agregar** > Nombre: `AvivaGo Bot` > Rol: `Administrador`.
4. Haz clic en **Agregar activos** > **Apps** > Selecciona tu App > Activa `Administrar app`.
5. Haz clic en **Generar nuevo token**.
6. Selecciona la App y los permisos:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
7. Copia el token generado. **Este token no expira**.

## Actualización en el Proyecto

Una vez tengas los datos anteriores:

1. Actualiza tu archivo `.env.local` (o variables de entorno en Vercel/Hosting):
   ```bash
   META_WHATSAPP_PHONE_ID=tu_nuevo_phone_id_real
   META_WHATSAPP_TOKEN=tu_token_permanente
   ```

2. El código ha sido actualizado para usar la plantilla `avivago_otp`. Asegúrate de haberla creado con ese nombre exacto.
