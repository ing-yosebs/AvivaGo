# Flujo y Estados de Usuarios - AvivaGo

Este documento detalla el ciclo de vida, los estados y los requisitos dentro del panel de administración. A partir de las últimas actualizaciones, el sistema evalúa a los usuarios a través de **dos contenedores independientes** ("Canastas de Estado") para evitar cruces de privilegios.

---

## 1. Perfil Base (Pasajero)

Todo usuario registrado en la plataforma posee este perfil base. Su estado se evalúa automáticamente y no requiere aprobación manual por parte del equipo de administración.

| Estado en Panel | Condición Interna | Descripción de la Condición | Consecuencias / Requisitos |
| --- | --- | --- | --- |
| 🟠 **Email Pendiente** | `unconfirmed` | El usuario recién creó su cuenta. | Falta verificar su correo electrónico (`email_confirmed_at`). No puede usar el sistema. |
| 🔵 **Incompleto** | `incomplete` | El correo está verificado, pero faltan datos en el perfil. | Faltan campos críticos: **Nombre Completo**, **Teléfono** o **Correo**. No puede contactar conductores. |
| 🟢 **Validado** | `validated` | Cuenta con correo verificado, nombre y teléfono capturados. | Tiene luz verde; cumple con todos los requisitos para buscar y contactar conductores en la app. |

---

## 2. Perfil Extendido (Conductor - Autogestión)

El perfil de Conductor (`driver_profiles`) opera bajo el concepto de **Autogestión Híbrida**.
Al llenar el alta inicial, el sistema asigna automáticamente el estado **Validado (`active`)** con luz verde en visibilidad (`is_visible: true`). 

**¿Por qué nace Validado y Visible? (Modelo Free)**
Para permitir al conductor compartir de inmediato su propio código QR o enlace web personalizado con pasajeros conocidos, fungiendo como una herramienta tecnológica independiente. 

**¿Dónde entra el Admin / Seguridad? (Modelo VIP)**
Aunque un conductor sea de entrada Validado (`active`), el sistema global de búsquedas orgánicas (Buscador Vip de AvivaGo) requiere una **Membresía Premium Vigente** (`driver_memberships.status`). Los conductores de capa "Free", aunque estén físicamente "Activos" en la base, son matemáticamente invisibles para el tráfico público VIP de la app.

| Estado en Panel | Estado Interno | Descripción y Situación | Acciones Posibles del Admin |
| --- | --- | --- | --- |
| 🟢 **Validado** | `active` | Estado de inicio automático para la Autogestión (QR y Link listos). | 👁️ **Ocultar / Mostrar Perfil** o ⚠️ **Suspender** (Requiere motivo). |
| ⚪ **Borrador** | `draft` | Modo temporal si un conductor interrumpe su pago/documentos en curso. | *Ninguna*. |
| 🟠 **En Revisión** | `pending_approval` | Apelación del conductor a una multa/castigo o solicitud de premium manual. | ✅ **Aprobar** o ❌ **Rechazar**. |
| 🔴 **Rechazado** | `rejected` | Un documento en su proceso de membresía VIP es inválido. | *Ninguna* (El conductor corrige). |
| 🔴 **Suspendido** | `suspended` | Inhabilitado manualmente por el admin. Abusa del Free o seguro vencido. | ✅ **Reactivar Cuenta**. |

### Reglas de Independencia
- **Castigos del Admin (`is_visible: false`):** Si usas el botón de Suspender o Rechazar en el panel, el sistema matará la visibilidad pública automática. El conductor no podrá usar ni abrir su QR.
- **Doble Canasta Visual:** En la tabla de administración, siempre verás dos placas (ej: Pasajero: *Validado* | Conductor: *Validado/Suspendido*).
- **Herencia de Validación:** Un "Conductor Activo" asume la capacidad inmediata de usar el servicio también como "Pasajero Validado".

---

## 3. Check-list de Revisión Administrativa (Conductores)

Cuando el estado de un conductor es **En Revisión**, el administrador utilizará la pantalla de *"Detalle de Usuario"* para analizar los documentos antes de aprobar o rechazar la solicitud:

### A. Información Personal y de Identidad
*   **Foto de Perfil:** Verificar claridad y presentación de la foto.
*   **Documento de Identificación:** INE (Frente y Reverso) vigentes.
*   **Verificación Biométrica:** Evaluar la correlación física entre la foto del INE, la Selfie de identidad y la Foto del Perfil Público.

### B. Información y Documentos del Vehículo
*   **Datos Coincidentes:** Confirmar congruencia visual con papelería.
*   **Placas y Fotos Físicas:** Revisar evidencias visuales generales.
*   **Papelería Legal del Vehículo:**
    *   Tarjeta de Circulación vigente.
    *   Factura del vehículo y Póliza de Seguro vigente.

---

## 4. Auditoría de Estados (Logs)

La plataforma cuenta con un sistema robusto de seguimiento. El sistema guarda un **Historial de Actividad** (`driver_status_logs`) detallando cada cambio de estado, el administrador responsable y la razón del movimiento.
