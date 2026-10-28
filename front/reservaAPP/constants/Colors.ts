/**
 * V&V Reservas — Mobile Design System: Color Tokens
 * Compatible con temas claro y oscuro, garantizando ratios de contraste WCAG AA (>=4.5:1).
 */

export const palette = {
  // Brand Blue
  primary50: "#EFF6FF",
  primary100: "#DBEAFE",
  primary200: "#BFDBFE",
  primary300: "#93C5FD",
  primary400: "#60A5FA",
  primary500: "#3B82F6",
  primary600: "#2563EB",
  primary700: "#1D4ED8",
  primary800: "#1E40AF",
  primary900: "#1E3A8A",

  // Accent / Amber
  accent50: "#FFFBEB",
  accent100: "#FEF3C7",
  accent400: "#FBBF24",
  accent500: "#F59E0B",
  accent600: "#D97706",

  // Semantic Status
  success50: "#ECFDF5",
  success500: "#10B981",
  success600: "#059669",
  success700: "#047857",

  warning50: "#FFFBEB",
  warning500: "#F59E0B",
  warning600: "#D97706",

  error50: "#FEF2F2",
  error500: "#EF4444",
  error600: "#DC2626",
  error700: "#B91C1C",

  // Neutral Slate
  slate50: "#F8FAFC",
  slate100: "#F1F5F9",
  slate200: "#E2E8F0",
  slate300: "#CBD5E1",
  slate400: "#94A3B8",
  slate500: "#64748B",
  slate600: "#475569",
  slate700: "#334155",
  slate800: "#1E293B",
  slate900: "#0F172A",
  slate950: "#020617",

  // Seat Status Colors (Específicos para transporte)
  seatAvailable: "#10B981",
  seatSelected: "#2563EB",
  seatOccupied: "#94A3B8",
  seatLocked: "#F59E0B",
};

export const Colors = {
  light: {
    primary: palette.primary600,
    primaryDark: palette.primary800,
    primaryLight: palette.primary100,
    accent: palette.accent500,
    success: palette.success600,
    warning: palette.warning600,
    error: palette.error600,

    text: palette.slate900,
    textSecondary: palette.slate600,
    textMuted: palette.slate500,
    textInverse: "#FFFFFF",

    background: palette.slate50,
    surface: "#FFFFFF",
    surfaceElevated: palette.slate100,
    surfaceMuted: "#F8FAFC",

    border: palette.slate200,
    borderSubtle: palette.slate100,
    borderStrong: palette.slate300,

    tint: palette.primary600,
    tabIconDefault: palette.slate400,
    tabIconSelected: palette.primary600,

    // Bus Seat Mapping
    seatAvailable: palette.seatAvailable,
    seatSelected: palette.seatSelected,
    seatOccupied: palette.seatOccupied,
    seatLocked: palette.seatLocked,

    // Overlays
    overlay: "rgba(15, 23, 42, 0.4)",
  },
  dark: {
    primary: palette.primary400,
    primaryDark: palette.primary600,
    primaryLight: palette.primary900,
    accent: palette.accent400,
    success: palette.success500,
    warning: palette.warning500,
    error: palette.error500,

    text: palette.slate50,
    textSecondary: palette.slate300,
    textMuted: palette.slate400,
    textInverse: palette.slate900,

    background: "#0B1120", // Deep midnight slate
    surface: palette.slate800,
    surfaceElevated: palette.slate700,
    surfaceMuted: "#0F172A",

    border: palette.slate700,
    borderSubtle: "#1E293B",
    borderStrong: palette.slate600,

    tint: palette.primary400,
    tabIconDefault: palette.slate500,
    tabIconSelected: palette.primary400,

    // Bus Seat Mapping
    seatAvailable: "#34D399",
    seatSelected: palette.primary400,
    seatOccupied: palette.slate600,
    seatLocked: palette.accent400,

    // Overlays
    overlay: "rgba(0, 0, 0, 0.7)",
  },
};

/**
 * Función utilitaria para agregar opacidad a un color hex
 */
export function withOpacity(hex: string, alpha: number): string {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return hex;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export default Colors;
