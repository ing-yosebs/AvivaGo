# Flujos de Usuario MVP (AvivaGo)

Adaptado al modelo de **Suscripción de Conductores**.

## 1. Inventario de Pantallas Clave

### A. Pasajero (Gratuito)
1.  **Home:** Buscador de conductores (por zona, vehículo, necesidades).
2.  **Perfil de Conductor (Público):**
    *   Visible inmediatamente tras el registro (`draft`) si el conductor lo habilita.
    *   Información completa (Bio, Auto, Servicios).
    *   **Botón de Contacto:** WhatsApp Directo (Visible sin pago).
    *   **Solicitar Cotización:** Botón para pedir viaje específico.
3.  **Mis Solicitudes:** Estado de las cotizaciones enviadas.

### B. Conductor (Suscripción)
1.  **Dashboard:** Resumen de actividad y estado de membresía.
2.  **Mi Perfil (Configuración):**
    *   *Tab Servicios:* Definir horarios y zonas. Toggle "Visible".
    *   *Tab Marketing:* Descargar QR, Tarjetas, Flyers.
    *   *Tab Pagos:* Comprar/Renovar Membresía.
3.  **Tablero de Solicitudes:** Ver viajes pedidos por pasajeros en su zona.

---

## 2. Flujos de Usuario (User Journeys)

### Flujo 1: Conductor se Reactiva ("El Negocio Propio")
1.  **Login:** Conductor entra al panel. Ve aviso "Membresía Vencida".
2.  **Compra:** Va a la sección "Pagos". Paga mes de servicio.
3.  **Activación:** El sistema confirma pago.
4.  **Marketing:** Va a la pestaña "Marketing".
5.  **Acción:** Descarga su "Tarjeta Digital" con QR.
6.  **Promoción:** La comparte en su WhatsApp. Sus clientes ahora pueden reservar directamente desde su perfil AvivaGo.

### Flujo 2: Pasajero Busca Confianza ("El Viaje Seguro")
1.  **Búsqueda:** Pasajero entra buscando "Transporte Pet Friendly Norte".
2.  **Resultados:** Ve lista de conductores verificados (que pagan suscripción).
3.  **Selección:** Elige a "Laura P.". Ve sus fotos y reseñas.
4.  **Contacto:** Clic en botón "WhatsApp". Inicia chat directo: *"Hola Laura, vi tu perfil en AvivaGo..."*.
5.  **Cierre:** Acuerdan viaje offline. AvivaGo facilitó la conexión segura.

### Flujo 3: Solicitud de Cotización ("El Viaje Planeado")
1.  **Solicitud:** Pasajero publica: "Viaje al Aeropuerto, Viernes 5AM, 2 maletas grandes".
2.  **Notificación:** Conductores en la zona ven la solicitud.
3.  **Oferta:** Conductores interesados contactan al pasajero con su tarifa.
4.  **Elección:** Pasajero elige la mejor opción.

---

## 3. Notas de Diseño
*   **Enfoque en Marketing:** El valor para el conductor es la *herramienta de venta*. El panel debe hacerlos sentir "profesionales" con recursos de calidad (Flyers generados).
*   **Referidos:** Integrar el botón "Invitar Colega" en el flujo principal para impulsar el crecimiento orgánico a cambio de beneficios (Nivel Oro).
