# V&V Reservas — Sistema de Diseño

<!-- impeccable:design-schema 1 -->

## Filosofía de Diseño y Principios

1. **Claridad Operativa y Transparencia**: La disponibilidad de pasajes, asientos y confirmaciones debe ser inmediata y libre de ambigüedades.
2. **Jerarquía Visual Rigurosa**: Tipografía clara (iOS Dynamic Type / Material 3), contrastes certificados (WCAG 2.1 AA >= 4.5:1), y estados interactivos distinguibles.
3. **Plataforma Nativa**: En móvil (`front/reservaAPP`), respetar los estándares táctiles (mínimo 48dp/44pt para cualquier control interactivo), gestos fluidos y soporte de temas Claro y Oscuro de primer nivel.
4. **Cero Adornos Inútiles**: Eliminar animaciones infinitas o halos falsos; la profundidad se genera mediante elevación real (`Shadows` multiplataforma) y bordes sutiles.

---

## 1. Tokens de Color (`front/reservaAPP/constants/Colors.ts`)

| Token | Modo Claro | Modo Oscuro | Uso Semántico |
|---|---|---|---|
| `primary` | `#2563EB` (Blue 600) | `#60A5FA` (Blue 400) | Acciones primarias, botones destacados, acento de marca |
| `primaryDark` | `#1E40AF` | `#2563EB` | Hover/press en primario, títulos corporativos |
| `accent` | `#F59E0B` (Amber 500)| `#FBBF24` (Amber 400) | Destacados temporales, avisos |
| `success` | `#059669` (Emerald 600)| `#10B981` (Emerald 500)| Reservas confirmadas, ventas concretadas, asientos libres |
| `warning` | `#D97706` | `#F59E0B` | Asientos bloqueados temporalmente, pagos pendientes |
| `error` | `#DC2626` (Red 600) | `#EF4444` (Red 500) | Mensajes de error, cancelaciones, validaciones fallidas |
| `background` | `#F8FAFC` (Slate 50) | `#0B1120` (Midnight) | Fondo general de las pantallas |
| `surface` | `#FFFFFF` | `#1E293B` (Slate 800) | Fondo de tarjetas, campos y contenedores |
| `surfaceElevated` | `#F1F5F9` | `#334155` (Slate 700) | Elementos elevados, inputs secundarios, chips |
| `border` | `#E2E8F0` (Slate 200) | `#334155` (Slate 700) | Separadores y bordes estándar |
| `text` | `#0F172A` (Slate 900) | `#F8FAFC` (Slate 50) | Texto principal de lectura |
| `textSecondary` | `#475569` (Slate 600) | `#CBD5E1` (Slate 300) | Subtítulos, labels, descripciones |
| `textMuted` | `#64748B` (Slate 500) | `#94A3B8` (Slate 400) | Placeholders, metadatos, timestamps |

### Asientos de Minibús
- `seatAvailable`: `#10B981` (Verde esmeralda)
- `seatSelected`: `#2563EB` (Azul primario seleccionado)
- `seatOccupied`: `#94A3B8` (Gris bloqueado/ocupado)
- `seatLocked`: `#F59E0B` (Ámbar en proceso de compra)

---

## 2. Tipografía (`front/reservaAPP/constants/Typography.ts`)

| Rol | Tamaño | Interlineado | Peso | Uso |
|---|---|---|---|---|
| `display` | 32pt | 38pt | 800 (Heavy) | Bienvenida, splash, pantallas hero |
| `title1` | 24pt | 30pt | 700 (Bold) | Título principal de la pantalla |
| `title2` | 20pt | 26pt | 700 (Bold) | Título de secciones o modales |
| `headline`| 17pt | 22pt | 600 (Semibold)| Encabezado de tarjetas y grupos |
| `body` | 15pt | 22pt | 400 (Regular) | Párrafos y contenido general |
| `callout` | 14pt | 20pt | 500 (Medium) | Botones y llamadas de acción |
| `caption` | 12pt | 16pt | 500 (Medium) | Metadatos, horas, fechas |
| `captionSmall`| 11pt | 14pt | 700 (Bold) | Badges y estados compactos |
| `priceLarge` | 22pt | 28pt | 800 (Heavy) | Precio principal en tarjetas de viaje |

---

## 3. Espaciado y Cuadrícula (`front/reservaAPP/constants/Spacing.ts`)

- **Escala de Espaciado**: `xs (4)`, `sm (8)`, `md (12)`, `base (16)`, `lg (20)`, `xl (24)`, `2xl (32)`, `3xl (40)`, `4xl (48)`.
- **Radios de Borde (`Radii`)**: `sm (8)`, `md (12)`, `lg (16)`, `xl (24)`, `full (9999)`.
- **Objetivos Táctiles (`Layout.minTouchTarget`)**: Mínimo **48dp/pt** para evitar toques erráticos en dispositivos móviles.

---

## 4. Biblioteca de Componentes Reutilizables (`front/reservaAPP/components/ui/`)

### `Button`
```tsx
import { Button } from "@/components/ui";

<Button variant="primary" size="md" icon="checkmark" onPress={handleConfirm}>
  Confirmar Reserva
</Button>
<Button variant="outline" size="sm" onPress={handleCancel}>
  Volver
</Button>
<Button variant="destructive" fullWidth loading={isDeleting}>
  Eliminar
</Button>
```
- **Variantes**: `primary`, `secondary`, `outline`, `ghost`, `destructive`.
- **Tamaños**: `sm` (36pt), `md` (48pt - estándar), `lg` (54pt).
- Soporte para `fullWidth`, `pill`, `loading`, `icon` (izq/der).

### `InputField`
```tsx
import { InputField } from "@/components/ui";

<InputField
  label="Contraseña"
  icon="lock-closed-outline"
  isPassword
  placeholder="••••••••"
  value={pass}
  onChangeText={setPass}
  error={errores.pass}
  required
/>
```
- Incluye toggle integrado de visibilidad para contraseñas (`isPassword`).
- Soporte de ícono izquierdo y derecho, botón para limpiar (`clearable`), estados de foco, validación con icono de alerta y texto de ayuda.

### `Card`
```tsx
import { Card } from "@/components/ui";

<Card variant="elevated" onPress={goToDetails}>
  {/* Contenido */}
</Card>
```
- **Variantes**: `elevated` (con sombra sutil), `outlined` (borde 1px), `flat` (fondo elevado sin borde).
- Feedback háptico/escala automático al presionar cuando se provee `onPress`.

### `Badge`
```tsx
import { Badge } from "@/components/ui";

<Badge variant="success" showDot>Confirmada</Badge>
<Badge variant="warning">Pendiente</Badge>
```
- **Variantes**: `primary`, `secondary`, `success`, `warning`, `error`, `neutral`.
- Opciones: `showDot`, `icon`, tamaños `sm` y `md`.

### `FeedbackBanner`
```tsx
import { FeedbackBanner } from "@/components/ui";

<FeedbackBanner
  type="error"
  message="Error de conexión con el servidor. Verifica tu internet."
  onDismiss={() => setError("")}
/>
```
- Banners de feedback para formularios y vistas con icono semántico y botón de descarte.

### `Divider`
```tsx
import { Divider } from "@/components/ui";

<Divider label="o continuar con" />
```

### Primitivas de Tipografía
```tsx
import { Title, Subtitle, Headline, Body, Caption, MoneyText } from "@/components/ui";

<Title>Próximos Viajes</Title>
<MoneyText amount={15000} size="lg" color="primary" />
```

---

## 5. Movimiento y Animaciones (Motion Thesis)

El movimiento en la aplicación móvil no es decorativo: **confirma acciones, comunica estado y aporta fluidez sin demorar al usuario**.

- **Entrada Escalonada (`FadeInView`)**:
  - Duración estándar: `280ms - 320ms` con `useNativeDriver: true`.
  - Opacidad (`0 -> 1`) y desplazamiento suave (`8px - 10px`).
  - Utilizado al montar pantallas (header `delay=0`, card `delay=90ms`).
- **Micro-interacción Táctil en Botones (`Button`)**:
  - Reducción física de escala a `0.97` con `Animated.spring` al presionar (`onPressIn`) y regreso con rebote sutil al soltar (`onPressOut`).
- **Foco en Campos de Entrada (`InputField`)**:
  - Escala suave del ícono a `1.1` al recibir foco, reconociendo el cursor activo.
- **Micro-shake en Notificaciones de Error (`FeedbackBanner` / `InputField`)**:
  - Sacudida horizontal sutil (desplazamiento de `[-5, 5, -3, 3, 0]px` en `240ms`) cuando se produce un error de validación o red.

