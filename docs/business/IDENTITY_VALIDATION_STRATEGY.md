# Protocolo de Seguridad y Verificación de Identidad (AvivaTrust)

Este documento define las reglas de negocio, los requisitos técnicos y el flujo de validación para asegurar la integridad de la comunidad de AvivaGo, mitigando el riesgo de cuentas falsas, ataques de identidad (Sybil attacks) y fraudes.

---

## 1. Verificación vía WhatsApp (OTP)
**Objetivo:** Vincular cada cuenta digital a un número de teléfono móvil real y activo.

### Reglas de Negocio:
- **Canal Oficial:** Se utilizará exclusivamente la API Oficial de WhatsApp Business (Meta) para el envío de códigos.
- **Momento de Activación:** El proceso de verificación es obligatorio durante el registro o al intentar acceder por primera vez a funciones críticas (ej. ver datos de contacto).
- **Código OTP:** Generación de un código numérico de 6 dígitos con una validez de 5 minutos.
- **Límite de Intentos:** Máximo 3 reintentos de envío cada 30 minutos por número de teléfono para evitar abusos de costos de API.
- **Unicidad:** Un número de teléfono verificado no puede vincularse a más de una cuenta activa en la plataforma.

---

## 2. Device Fingerprinting (Huella Digital del Hardware)
**Objetivo:** Identificar de manera única el dispositivo físico desde el cual se accede a la plataforma para prevenir la creación de múltiples cuentas por parte de un mismo individuo.

### Reglas de Negocio:
- **Identificador Único (DeviceID):** Se generará una huella digital basada en variables de hardware (CPU, GPU, resolución, fuentes del sistema, zona horaria, etc.).
- **Registro de Huella:** El `DeviceID` se captura y almacena en cada registro exitoso e inicio de sesión.
- **Bloqueo Preventivo:**
    - Si un `DeviceID` está asociado a una cuenta con estado "Suspendida" o "Baneada", se bloqueará preventivamente cualquier intento de registro nuevo desde ese hardware.
    - Se permite un máximo de **2 cuentas** por dispositivo (ej. uso familiar). Una tercera cuenta activa desde el mismo dispositivo activará una alerta de "Fraude Potencial" para revisión manual.
- **Persistencia:** La huella debe ser consistente incluso si el usuario limpia cookies o usa navegación privada.

---

## 3. Selfie de Vida (Biometría / Liveness)
**Objetivo:** Garantizar que el usuario es una persona real y que coincide con los documentos de identidad proporcionados.

### Reglas de Negocio:
- **Captura en Vivo:** El sistema solicitará acceder a la cámara para tomar una fotografía en tiempo real (Selfie). No se permiten subidas de galería para este paso.
- **Prueba de Vida (Liveness):** Se implementará un componente que detecte puntos faciales para asegurar que no es una foto de una pantalla o una máscara.
- **Comparación (Face Matching):**
    - Se realizará una comparación algorítmica entre la "Selfie de Vida" y la fotografía del Documento de Identidad (INE/Cédula) ya subido por el usuario.
    - Se debe obtener un "Score de Confianza" superior al 85%.
- **Resultado:**
    - **Match Exitoso:** El usuario recibe la insignia de "Verificado".
    - **No Coincidencia:** Se marca para revisión manual por un administrador de AvivaGo.

---

## 4. Bloqueo de Correos Temporales
**Objetivo:** Evitar que los usuarios utilicen servicios de correo desechables para evadir baneos o crear cuentas spam.

### Reglas de Negocio:
- **Lista Negra (Allow/Deny List):** El sistema consultará una base de datos actualizada de dominios de correos temporales (ej. `10minutemail.com`, `guerrillamail.com`, `temp-mail.org`).
- **Validación en Tiempo Real:** Durante el registro (Frontend y Backend), se validará la terminación del dominio del correo.
- **Restricción:** No se permitirán registros con dominios detectados. Se le solicitará al usuario un correo corporativo o personal estable (Gmail, Outlook, iCloud, etc.).

---

## 5. El Flujo de Verificación (User Journey)

1. **Registro:** El usuario ingresa Correo (se valida vs lista negra) y Contraseña.
2. **OTP:** El usuario ingresa su teléfono y recibe el código por WhatsApp.
3. **Hardware:** Se captura el `DeviceID` silenciosamente.
4. **Documentos:** El usuario sube su Identificación Oficial (Proceso actual).
5. **Biometría:** El sistema pide la Selfie, valida la vida y compara con la identificación.
6. **Aprobación:** Si todo coincide, el perfil pasa de `pending_approval` a `active`.

---

## 6. Variables de Base de Datos Necesarias
Para soportar esta estrategia, se requerirán los siguientes campos en `public.users` o `public.auth_meta`:
- `phone_verified` (boolean)
- `phone_verified_at` (timestamp)
- `device_id` (text)
- `is_device_flagged` (boolean)
- `biometric_match_score` (numeric)
- `biometric_status` (enum: pending, approved, rejected, manual_review)
