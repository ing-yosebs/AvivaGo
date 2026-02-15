# Modelo Conceptual de Producto: AvivaGo

Este documento define la estructura lógica y de negocio de "AvivaGo" desde una perspectiva de Arquitectura de Producto Digital.

## 1. Entidades Principales

Identificamos los "objetos" clave que componen el negocio.

*   **Usuario (Cuenta):** La entidad base de acceso. Puede ser Pasajero, Conductor o ambos.
*   **Perfil de Conductor (Vitrina):** La ficha pública que ofrece servicios. Requiere una **Membresía Activa** para ser visible.
*   **Vehículo:** El activo físico asociado al conductor.
*   **Membresía (Suscripción):** El estado que otorga al conductor visibilidad en el directorio y acceso a herramientas premium.
*   **Solicitud de Cotización:** Un pedido de viaje específico creado por un pasajero y enviado a conductores cercanos.
*   **Kit de Marketing (Herramienta):** Activos digitales (QR, Flyers) para que el conductor promocione su perfil.
*   **Referido:** Sistema de crecimiento viral donde usuarios invitan a otros y ganan beneficios (Niveles o Créditos).

---

## 2. Atributos Clave por Entidad

### Usuario (Cuenta)
*   **Datos Identidad:** Email, Teléfono verificado, Nombre real.
*   **Roles:** Lista de permisos (`['cliente', 'conductor']` o `['admin']`).
*   **Código de Referido:** Identificador único para invitar a otros.

### Perfil de Conductor
*   **Identidad Profesional:** Foto, Biografía, "Sello de Servicio".
*   **Operación:** Zonas de cobertura, Horarios, Idiomas.
*   **Estado:**
    *   **Visible:** Aparece públicamente si `is_visible` es `true` (Incluye estados `draft`, `pending_approval` y `active`).
    *   **Oculto:** No aparece (Decisión del conductor, falta de pago o estado `suspended`/`rejected`).
    *   **Indexación:** Solo perfiles Premium/Activos son indexados por buscadores (SEO).
*   **Nivel de Afiliado:** Bronce, Plata, Oro (determinado por número de referidos).
*   **Reputación:** Calificación promedio y Comentarios.

### Membresía (Suscripción)
*   **Estado:** Activa, Vencida, Prueba (Trial).
*   **Vencimiento:** Fecha límite de acceso a beneficios.
*   **Beneficios:** Visibilidad en catálogo, Contacto directo, Kit de Marketing.

### Solicitud de Cotización
*   **Detalles:** Origen, Destino, Fecha/Hora, Pasajeros, Requisitos (Mascotas, etc.).
*   **Estado:** Abierta, Cotizada, Cerrada.

---

## 3. Matriz de Acciones por Rol

### Visitante / Pasajero
*   **Explorar:** Buscar conductores por filtros (zona, auto, servicios).
*   **Contactar:** Ver WhatsApp/Teléfono de conductores (si el conductor tiene Membresía).
*   **Cotizar:** Publicar una solicitud de viaje para recibir ofertas.
*   **Evaluar:** Dejar reseña tras un servicio.

### Conductor (Proveedor)
*   **Gestionar Perfil:** Editar vitrina, vehículos y servicios.
*   **Suscripción:** Pagar membresía para activar visibilidad.
*   **Marketing:** Descargar Kit Profesional (QR, Tarjetas) - *Página "Marketing"*.
*   **Cotizar:** Ver y responder solicitudes de pasajeros.
*   **Referir:** Invitar colegas/pasajeros para subir de nivel (Plata/Oro).

### Administrador
*   **Gestión:** Validar documentos y perfiles.
*   **Soporte:** Gestión de reportes y usuarios.
*   **Marketing:** Aprobar solicitudes de Kits físicos.

---

## 4. Eventos de Cambio de Estado

1.  **Evento: Activación de Membresía**
    *   *Disparador:* Conductor paga suscripción o inicia Trial.
    *   *Efecto:* El perfil se vuelve "Visible" en el directorio. Se desbloquean herramientas de Marketing.

2.  **Evento: Solicitud de Cotización**
    *   *Disparador:* Pasajero publica necesidad de viaje.
    *   *Efecto:* Conductores compatibles reciben notificación y pueden enviar propuesta.

3.  **Evento: Cambio de Nivel (Gamification)**
    *   *Disparador:* Conductor alcanza X referidos.
    *   *Efecto:* Sube a Nivel Plata/Oro, desbloqueando descuentos o features exclusivos (ej. Kit Físico).

---

## 5. Diagrama Mental (El Modelo "SaaS + Marketplace")

1.  **El Conductor es el Cliente:** Paga una **Membresía (SaaS)** para tener su "Propia Web" dentro de AvivaGo y herramientas de venta.
2.  **El Pasajero es el Usuario Final:** Usa la plataforma gratis para encontrar proveedores de confianza.
3.  **El Valor es la Conexión:** AvivaGo cobra por *permitir que te encuentren*, no por el viaje.
4.  **Crecimiento Viral:** Conductores traen a sus propios pasajeros (usando su QR/Marketing Kit) porque les conviene centralizar su reputación en un solo lugar.
