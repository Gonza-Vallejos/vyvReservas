# Brief de Rediseño: Experiencia del Pasajero (VyV Reservas)

> Fase: `shape` — planificación UX/UI antes de escritura de código.  
> Superficie: flujo completo del pasajero final en web (React + Vite) y móvil (React Native + Expo).  
> Modo del visitante: **Operate** (completar una tarea: buscar, reservar y pagar un pasaje de minibus).  
> Plataforma: **adaptive** (iOS + Android + web responsive).

---

## 1. Resumen y alcance

Rediseñar la superficie orientada al **pasajero final** de VyV Reservas, desde la búsqueda inicial hasta la gestión de reservas y perfil, logrando coherencia visual y funcional entre la app web y la app móvil. No se modifica el backend ni los flujos de empresa/chofer/mostrador/admin.

### Pantallas y flujos incluidos
1. Home / Búsqueda (origen, destino, fecha).  
2. Resultados de búsqueda / lista de viajes.  
3. Detalle de viaje.  
4. Selección de asientos / datos de pasajeros.  
5. Confirmación de reserva / estado de pago.  
6. Mis reservas / tickets.  
7. Perfil / cuenta.

### Supuestos marcados
- La integración de pagos online (MercadoPago, tarjetas, etc.) aún no está definida; el diseño contempla estados **Pendiente de pago** y **Pagado/Confirmado**, con un CTA de pago extensible.  
- El pasajero puede reservar hasta 3 asientos por viaje (regla de negocio actual).  
- La app móvil sirve a varios roles; este brief se centra en la pestañas y flujos del rol **Cliente/Pasajero**.  
- No existe identidad visual formal: se propone una paleta nueva pero contenida, evolutiva respecto al azul actual de la web.

---

## 2. Audiencia y modo

- **Quién llega:** personas que viajan entre localidades de la región usando minibuses de empresas asociadas.  
- **Contexto:** mayormente en dispositivos móviles, con conectividad variable, a menudo apuradas o comparando horarios.  
- **Tarea principal:** encontrar un viaje para una fecha y ruta, elegir asientos, cargar datos de pasajeros y asegurar la reserva/pago.  
- **Éxito:** la reserva queda registrada, el pasajero sabe dónde y cuándo aborda, y puede acceder al comprobante/ticket.

**Modo Operate:** la interfaz debe desaparecer para que el usuario complete la tarea. Familiaridad, escaneabilidad y retroalimentación clara priman sobre la expresión visual.

---

## 3. Principios de diseño

1. **Una sola verdad por pantalla.** Cada paso responde una pregunta: ¿dónde viajo?, ¿cuándo?, ¿qué viaje?, ¿dónde me siento?, ¿quién viaja?, ¿quedó confirmado?  
2. **Móvil primero, desktop ampliado.** El mismo flujo funciona en un teléfono; en desktop se aprovecha el espacio para paneles laterales y vistas combinadas.  
3. **Estados visibles.** Siempre se muestra disponibilidad real, estado de pago, errores de validación y acciones posibles.  
4. **Componentes coherentes.** Mismos nombres, mismos colores semánticos, mismos patrones de tarjeta/botón/formulario en web y móvil.  
5. **Accesible desde el inicio.** Contraste, foco, lectores de pantalla, tamaños de toque y reducción de movimiento son requisitos, no mejoras posteriores.

---

## 4. Sistema visual propuesto

### Estrategia de color: **Restrained**
- Fondo claro neutro con superficies blancas; modo oscuro derivado del esquema del sistema en móvil y toggle/preference en web.  
- Un único color primario para acciones principales y estados de selección; acento cálido solo para alertas de escasez y elementos secundarios.

### Paleta base (tokens)

| Token | Valor claro | Uso |
|-------|-------------|-----|
| `--color-primary` | `#2563EB` | CTAs principales, selección, enlaces |
| `--color-primary-dark` | `#1E40AF` | Hover/activo, fondos de estado |
| `--color-accent` | `#F59E0B` | Alerta de pocos asientos, iconos de advertencia |
| `--color-success` | `#10B981` | Pagado, confirmado, disponible |
| `--color-error` | `#EF4444` | Errores, cancelación |
| `--color-warning` | `#F97316` | Pendiente de pago, atención |
| `--color-text` | `#0F172A` | Texto principal |
| `--color-text-secondary` | `#475569` | Subtítulos, metadatos |
| `--color-text-muted` | `#94A3B8` | Placeholders, deshabilitado |
| `--color-background` | `#F8FAFC` | Fondo de página |
| `--color-surface` | `#FFFFFF` | Tarjetas, modales, formularios |
| `--color-surface-elevated` | `#F1F5F9` | Fondos de grupo, divisores suaves |
| `--color-border` | `#E2E8F0` | Bordes de inputs y tarjetas |

**Modo oscuro (móvil):** `--color-background=#0F172A`, `--color-surface=#1E293B`, `--color-text=#F8FAFC`.

### Tipografía
- **Web:** `Inter` para UI/cuerpo, `Outfit` para títulos y marca (se conservan las fuentes actuales pero se sistematizan).  
- **Móvil:** fuentes del sistema — `SF Pro` en iOS, `Roboto` en Android — siguiendo las escalas de Dynamic Type / Material type scale.  
- Escala: `xs=12`, `sm=14`, `base=16`, `lg=18`, `xl=20`, `2xl=24`, `3xl=30`.

### Espaciado y forma
- Espaciado base 4 px: `4, 8, 12, 16, 20, 24, 32, 40, 48`.  
- Radios: `8, 12, 16, 20, 24, pill`.  
- Sombras sutiles solo sobre superficies claras (`shadow-sm`, `shadow-md`, `shadow-lg`).  
- En móvil: elevación por color de superficie, no sombras arbitrarias.

### Iconografía
- Web: `lucide-react`.  
- Móvil: `Ionicons` / SF Symbols en iOS, Material Icons en Android; se unifica el set por plataforma nativa.

---

## 5. Arquitectura de navegación

### Web (React Router)
- **Navbar superior fija:** logo, búsqueda rápida, "Mis Reservas", menú de usuario/login.  
- **Rutas del pasajero:**
  - `/` → Home con búsqueda.
  - `/viajes?origen=&destino=&fecha=` → Resultados.
  - `/viaje/:id` → Detalle de viaje.
  - `/reservar/:id` → Flujo de reserva (asientos + pasajeros).
  - `/confirmacion/:reservaId` → Confirmación y estado de pago.
  - `/mis-reservas` → Listado de reservas.
  - `/perfil` → Cuenta del usuario.

### Móvil (Expo Router, tabs)
**Tabs del pasajero (4 destinos):**
- **Inicio** — bienvenida, búsqueda rápida y accesos recientes.
- **Viajes** — búsqueda avanzada y resultados.
- **Mis Reservas** — tickets y estado de reservas.
- **Perfil** — cuenta, seguridad, ayuda.

**Stack de flujo de reserva:**
`Viajes` → `pantallas/detalleViaje` → `pantallas/seleccionarAsientos` → `pantallas/datosPasajeros` → `pantallas/confirmacionReserva`.

---

## 6. Flujo por pantallas

### 6.1 Home / Búsqueda
**Objetivo:** que el usuario defina origen, destino y fecha con la menor fricción posible.

- **Hero reducido** con mensaje claro: "Encontrá tu próximo viaje" / "Reservá pasajes de minibus".  
- **Formulario de búsqueda prominente** (pill en desktop, apilado en móvil):
  - Origen (autocomplete de localidades).
  - Botón de intercambio origen↔destino.
  - Destino (autocomplete).
  - Fecha (date picker, mínimo hoy).
  - Botón "Buscar viajes".
- **Atajos:** búsquedas recientes (si está logueado) y fechas rápidas (hoy, mañana, pasado mañana).
- **Estados:** error si falta origen/destino, loading en el botón.

### 6.2 Resultados / Lista de viajes
**Objetivo:** escanear opciones y elegir un viaje.

- **Barra superior fija:** resumen de ruta y fecha; selector horizontal de días cercanos (carrusel de -2 a +2 días).
- **Filtros opcionales:** horario (madrugada, mañana, tarde, noche) y ordenar por precio/horario.
- **Tarjeta de viaje:**
  - Badge de empresa.
  - Precio destacado.
  - Ruta: origen → destino con línea de conexión visual.
  - Fecha, hora de salida, duración estimada (si existe).
  - Lugares disponibles (verde si >5, ámbar/rojo si escasean).
  - CTA "Seleccionar".
- **Estados:** skeleton loader, empty state con sugerencia de cambiar fecha, error con retry.

### 6.3 Detalle de viaje
**Objetivo:** confirmar que este es el viaje correcto antes de reservar.

- Encabezado con empresa, ruta completa, fecha/hora.
- Bloque de información: precio por asiento, lugares libres, posibles paradas/terminales.
- Precio total dinámico según cantidad de asientos a seleccionar.
- CTA principal "Elegir asientos".
- Acción secundaria "Compartir viaje".

*En web este paso puede combinarse con la selección de asientos en un panel lateral; en móvil se mantiene como pantalla independiente para no saturar.*

### 6.4 Selección de asientos
**Objetivo:** elegir uno o más asientos disponibles.

- Mapa del minibus con orientación frontal (conductor arriba) y distribución realista de filas.
- Estados de asiento: libre, seleccionado, ocupado, no disponible.
- Leyenda de estados.
- Contador "X de 3 asientos".
- Botón "Continuar" habilitado solo con al menos un asiento seleccionado.
- En móvil: scroll y zoom si el mapa no entra en pantalla; en web: panel centrado.

### 6.5 Datos de pasajeros
**Objetivo:** capturar nombre, apellido, DNI y puntos de subida/bajada por cada asiento.

- Un formulario por asiento seleccionado, numerado y vinculado al número de asiento.
- Campos:
  - Nombre (texto).
  - Apellido (texto).
  - DNI (numérico).
  - Ubicación de subida (texto + mensaje de ayuda: calle con número o intersección).
  - Ubicación de bajada (texto + ayuda).
- Botón "Cargar mis datos" para autocompletar el primer pasajero desde el perfil.
- Validación inline y mapeo de errores del backend por campo (`personas[i].dni`, etc.).
- Resumen lateral/desktop y barra inferior sticky en móvil con total y botón "Confirmar reserva".

### 6.6 Confirmación de reserva / Pago
**Objetivo:** informar el resultado y orientar al siguiente paso.

- Pantalla de éxito con:
  - Código/número de reserva.
  - Resumen del viaje y pasajeros.
  - Estado de pago (Pendiente / Pagado).
  - Total.
- Si está pendiente:
  - Botón "Pagar ahora" (placeholder para futura integración) o "Ver medios de pago".
  - Indicación de plazo/validez de la reserva.
- Si está pagado:
  - Botón "Descargar comprobante" / "Compartir ticket" (reutilizar `imprimirComprobante.ts`).
- CTA secundario "Ir a Mis Reservas".
- Error state: mensaje claro + botón reintentar o volver.

### 6.7 Mis reservas / Tickets
**Objetivo:** gestionar reservas activas y consultar historial.

- Segmentación por pestañas/secciones:
  - **Próximos viajes confirmados** (con ticket descargable).
  - **Pendientes de pago** (con botón pagar/eliminar).
  - **Viajes finalizados** (histórico, atenuado visualmente).
- Tarjeta de reserva:
  - Ruta y fecha/hora destacadas.
  - Badge de estado (Confirmado, Pendiente, Finalizado).
  - Pasajeros (iniciales o lista expandible).
  - Total.
  - Acciones según estado: ver detalle, descargar ticket, pagar, cancelar.
- Empty state ilustrado: "Todavía no tenés viajes" con CTA a búsqueda.

### 6.8 Perfil / Cuenta
**Objetivo:** administrar datos personales, seguridad y preferencias.

- Header con avatar, nombre, email y rol.
- Secciones:
  - Datos personales (editar nombre, apellido, DNI, teléfono).
  - Seguridad (cambiar contraseña).
  - Mis reservas (acceso directo).
  - Configuración (tema oscuro/claro, notificaciones — si aplica).
  - Ayuda / contacto.
  - Cerrar sesión (estilo destructivo, al final).

---

## 7. Componentes clave reutilizables

| Componente | Descripción |
|------------|-------------|
| `SearchForm` | Origen/destino/fecha + autocomplete + swap. |
| `DateScroller` | Carrusel de días con día seleccionado. |
| `TripCard` | Tarjeta estándar de resultado de viaje. |
| `TripSummary` | Panel/bloque de resumen de viaje usado en detalle, reserva y confirmación. |
| `SeatMap` | Mapa interactivo de asientos del minibus. |
| `PassengerForm` | Formulario por pasajero con validación. |
| `PriceSummary` | Total, precio por asiento, botón de acción. |
| `BookingStatusBadge` | Estados: Pendiente, Confirmado, Finalizado, Cancelado. |
| `ReservationCard` | Tarjeta de reserva para "Mis reservas". |
| `EmptyState` | Ilustración + mensaje + CTA para listas vacías. |
| `SkeletonCard` | Placeholder de carga para tarjetas. |
| `InputField` | Input con label, icono, error y foco estilizado. |
| `PrimaryButton` / `SecondaryButton` / `GhostButton` | Botones consistentes con estados disabled/loading. |

---

## 8. Accesibilidad

- Cumplir **WCAG 2.1 AA** como piso mínimo.  
- Contraste de texto 4.5:1 sobre fondos; 3:1 para componentes grandes.  
- Indicadores de foco visibles en web; outlines de 2 px en inputs y botones.  
- Targets de toque: **44×44 pt** en iOS, **48×48 dp** en Android.  
- Etiquetas `aria-label` / `accessibilityLabel` en iconos, asientos y acciones.  
- Agrupación semántica de formularios (`label`/`htmlFor`, `accessibilityHint`).  
- Soporte a **Reducir movimiento** (móvil) y `prefers-reduced-motion` (web): animaciones de entrada opcionales, transiciones funcionales.  
- Estados de error asociados a campos (`aria-describedby`, `accessibilityLiveRegion`).  
- Navegación por teclado completa en web.

---

## 9. Próximos pasos de implementación por plataforma

### Web (`front/web-app`)
1. **Tokens y estilos globales:** reemplazar/colapsar variables dispersas en `index.css` y crear tema claro/oscuro coherente. Eliminar estilos inline progresivamente.  
2. **Componentes base:** crear `Button`, `InputField`, `Card`, `Badge`, `EmptyState`, `Skeleton` con estados completos (default, hover, focus, active, disabled, loading).  
3. **Home:** rediseñar `SearchForm` y hero; agregar atajos de búsquedas recientes.  
4. **Resultados:** evolucionar `DateSelectorBar` y `TripCard`; agregar filtros y skeleton.  
5. **Nueva pantalla `TripDetail`:** detalle de viaje antes del flujo de reserva.  
6. **Flujo de reserva:** refactor `BookingPage` combinando `SeatSelector` + `PassengerForm` en pasos claros; hacer `SeatSelector` accesible y responsive.  
7. **Confirmación:** crear `BookingConfirmationPage` con estados de pago.  
8. **Mis reservas:** refactor `MyReservationsPage` con agrupación por estado y acciones.  
9. **Perfil:** crear `ProfilePage` (no existe actualmente).  
10. **Responsive y QA:** probar 320 px, 768 px, 1440 px; verificar modo oscuro, foco y lectores de pantalla.

### Móvil (`front/reservaAPP`)
1. **Tokens de color:** actualizar `constants/Colors.ts` con la paleta propuesta y expandir `Themed.tsx` para soportar superficies, texto secundario, bordes, etc.  
2. **Componentes base en RN:** `Button`, `InputField`, `Card`, `Badge`, `EmptyState`, `SkeletonCard`, `BookingStatusBadge`.  
3. **Tabs del pasajero:** simplificar `(tabs)/_layout.tsx` para mostrar solo Inicio, Viajes, Mis Reservas y Perfil al rol cliente.  
4. **Home:** rediseñar `(tabs)/index.tsx` para pasajeros: saludo, búsqueda rápida, próximos viajes y accesos directos.  
5. **Búsqueda:** rediseñar `(tabs)/viajes.tsx` (unificar native/web donde sea posible) con autocomplete, resultados y tarjetas nuevas.  
6. **Detalle:** crear `pantallas/detalleViaje.tsx`.  
7. **Selección de asientos:** crear `pantallas/seleccionarAsientos.tsx` con mapa accesible.  
8. **Datos de pasajeros:** refactor `pantallas/realizarReserva.tsx` para separar/seleccionar asientos primero, luego formularios, con validación mapeada.  
9. **Confirmación:** crear `pantallas/confirmacionReserva.tsx` (pasajero).  
10. **Mis reservas:** refactor `(tabs)/reserva.tsx` con agrupación y tickets descargables.  
11. **Perfil:** rediseñar `(tabs)/perfil.tsx`.  
12. **Ajustes nativos:** safe areas, insets de teclado, navegación por gesto de retroceso en Android, Dynamic Type en iOS, soporte a reducción de movimiento.

### Compartido / cross-platform
- Definir utilidades comunes de formato de fecha/hora y moneda.  
- Unificar nombres de estados de reserva y pago en UI y copy.  
- Reutilizar servicios existentes (`viajeService`, `reservaService`, `ventaService`) sin cambiar contratos.  
- Documentar decisiones visuales en `DESIGN.md` una vez construida la primera pantalla de referencia.

---

## 10. Decisiones abiertas para el equipo/padre

1. **Integración de pagos:** ¿se implementará pago online (MercadoPago, Stripe, etc.) o solo reserva + pago en boletería? Esto define si el CTA "Pagar ahora" es funcional o informativo.  
2. **Cancelaciones:** ¿el pasajero puede cancelar una reserva pendiente desde la app/web? ¿Y una pagada?  
3. **Puntos de subida/bajada:** ¿son siempre libres o hay una lista de paradas por empresa?  
4. **Notificaciones:** ¿se enviarán push/email al confirmar/reservar? Esto afecta la pantalla de confirmación.  
5. **Nombre de marca:** ¿se usa "V&V Reservas", "VyV Reservas" o "V&V"? Se recomienda definir un logotipo/texto único antes de la primera implementación.

---

## 11. Anti-objetivos (lo que NO se hará en este alcance)

- No se rediseñan paneles de empresa, chofer, mostrador ni administrador.  
- No se modifica la lógica de backend, modelos ni transacciones de reserva.  
- No se generan nuevos activos de marca (ilustraciones, fotos, logotipos vectoriales) sin aprobación.  
- No se implementan animaciones decorativas largas o secuencias de carga teatrales.

---

*Brief producido en fase `shape` de Impeccable. No contiene código de implementación; sirve como contrato de diseño para el rediseño del flujo de pasajero.*
