# Modelo Conceptual de Producto: AvivaGo

Este documento define la estructura lógica y de negocio de "AvivaGo" desde una perspectiva de Arquitectura de Producto Digital, ignorando detalles técnicos de implementación.

## 1. Entidades Principales

Identificamos los "objetos" clave que componen el negocio.

*   **Usuario (Cuenta):** La entidad base de acceso. Representa a una persona real en el sistema.
*   **Perfil de Conductor (Vitrina):** La ficha pública que ofrece servicios. Un Usuario puede *tener* un Perfil de Conductor.
*   **Vehículo:** El activo físico asociado al conductor.
*   **Desbloqueo (Transacción):** El registro del pago realizado por un Usuario para acceder a los datos de contacto de un Conductor.
*   **Reseña (Reputación):** La evaluación de una interacción.
*   **Reporte (Moderación):** Mecanismo de seguridad y control de calidad.

---

## 2. Atributos Clave por Entidad

### Usuario (Cuenta)
*   **Datos Identidad:** Email, Teléfono verificado, Nombre real.
*   **Roles:** Lista de permisos (Ej: `['cliente', 'conductor']` o `['admin']`).
*   **Estado:** Activo, Bloqueado, Pendiente de validación.

### Perfil de Conductor
*   **Presentación:** Foto de perfil (profesional), Biografía corta ("Acerca de mí").
*   **Operación:** Zonas de cobertura (Barrios/Ciudades), Horarios habituales.
*   **Estado de Vitrina:** Visible (Publicada), Oculta (Vacaciones/Baja), En Revisión (Moderación).
*   **Métricas Públicas:** Calificación promedio (1-5 estrellas), Total de contactos desbloqueados (popularidad), Antigüedad.

### Vehículo
*   **Info Básica:** Marca, Modelo, Año, Color.
*   **Características:** Aire acondicionado, capacidad de maletero, tipo de combustible.
*   **Seguridad:** Fotos del vehículo (interior/exterior), vigencia de seguro (bool).

### Desbloqueo (Producto Digital)
*   **Metadatos:** Fecha/Hora, Costo pagado.
*   **Vencimiento:** ¿El acceso al contacto es eterno o caduca? (Asumiremos eterno por ahora).
*   **Estado:** Completado, Reembolsado.

---

## 3. Matriz de Acciones por Rol

### Visitante (Sin cuenta)
*   **Explorar:** Buscar conductores por filtro (zona, tipo de auto).
*   **Ver:** Ver perfiles parciales (sin teléfono/WhatsApp).
*   **Registro:** Crear cuenta para avanzar.

### Cliente (Usuario Registrado)
*   **Comprar:** Pagar tarifa para revelar datos de contacto ("Desbloquear").
*   **Contactar:** Acceder a botones de WhatsApp/Teléfono tras el pago.
*   **Evaluar:** Dejar reseña (solo si hubo desbloqueo previo).
*   **Reportar:** Flaggear perfil sospechoso.

### Conductor (Proveedor)
*   **Gestionar Perfil:** Crear/Editar datos de la vitrina y vehículo.
*   **Gestionar Estado:** Ponerse "No Disponible" temporalmente.
*   **Consultar:** Ver historial de quién lo ha desbloqueado.

### Moderador
*   **Auditar:** Revisar nuevos perfiles antes de que se publiquen (opcional) o revisar ediciones.
*   **Resolver:** Atender reportes, ocultar perfiles que violan normas.

### Administrador
*   **Negocio:** Configurar precio del desbloqueo.
*   **Gestión:** Banear usuarios/conductores, otorgar permisos de moderador.

---

## 4. Eventos de Cambio de Estado

El sistema reacciona a estos disparadores de negocio:

1.  **Evento: Publicación de Perfil**
    *   *Disparador:* Conductor completa ficha y pide publicar.
    *   *Efecto:* Estado pasa a "Pendiente de Aprobación" (si hay moderación estricta) o "Visible" (si es post-moderación).

2.  **Evento: Pago Exitoso (Desbloqueo)**
    *   *Disparador:* Pasarela de pago confirma transacción.
    *   *Efecto:* Se crea registro "Desbloqueo". El Cliente ahora ve el atributo `telefono` del Conductor. El Conductor recibe notificación.

3.  **Evento: Reporte de Abuso**
    *   *Disparador:* Cliente reporta "Perfil Falso".
    *   *Efecto:* Se crea ticket para Moderador. Si un perfil acumula X reportes en Y tiempo, el sistema podría "Ocultar preventivamente" el perfil automáticamente.

4.  **Evento: Baja Reputación**
    *   *Disparador:* El promedio de estrellas cae por debajo de 3.0.
    *   *Efecto:* El perfil pierde visibilidad en los listados (baja al final) o se suspende automáticamente.

---

## 5. Diagrama Mental (Textual)

Imagina el flujo de valor como un embudo:

1.  **Nivel Superior (Mercado):**
    *   Existe un gran **Directorio** (Pool de Perfiles).
    *   Los **Filtros** (Zona, Auto) son las herramientas de navegación.

2.  **Nivel Intermedio (Interés):**
    *   Un **Usuario** selecciona una **Tarjeta (Perfil)**.
    *   Ve la **"Vitrina"** (Fotos, Estrellas), pero hay un **Cristal Empañado** sobre el botón de contacto.

3.  **Nivel Transaccional (La Llave):**
    *   El Usuario inserta una **Moneda (Pago)**.
    *   El **Cristal se rompe** (Evento Desbloqueo).
    *   Se establece el **Puente Directo** (WhatsApp/Teléfono) off-platform. AvivaGo ya no interviene en el viaje.

4.  **Nivel Retroalimentación (Cierre del ciclo):**
    *   Tiempo después, el Usuario regresa a la plataforma para dejar una **Huella (Reseña)** en el Perfil.
    *   Esta huella modifica la **Posición** del Conductor en el Directorio (Reputación afecta Visibilidad), reiniciando el ciclo para futuros usuarios.
