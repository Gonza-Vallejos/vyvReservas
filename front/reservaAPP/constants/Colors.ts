/**
 * V&V Reservas — Design Tokens
 * Basado en el brief de rediseño del pasajero.
 * Compartido entre modo claro y oscuro.
 */

const palette = {
  primary: "#2563EB",
  primaryDark: "#1E40AF",
  accent: "#F59E0B",
  success: "#10B981",
  error: "#EF4444",
  warning: "#F97316",
};

export default {
  light: {
    ...palette,
    text: "#0F172A",
    textSecondary: "#475569",
    textMuted: "#64748B",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceElevated: "#F1F5F9",
    border: "#E2E8F0",
    tint: palette.primary,
    tabIconDefault: "#94A3B8",
    tabIconSelected: palette.primary,
  },
  dark: {
    ...palette,
    text: "#F8FAFC",
    textSecondary: "#CBD5E1",
    textMuted: "#94A3B8",
    background: "#0F172A",
    surface: "#1E293B",
    surfaceElevated: "#334155",
    border: "#334155",
    tint: "#60A5FA",
    tabIconDefault: "#64748B",
    tabIconSelected: "#60A5FA",
  },
};
