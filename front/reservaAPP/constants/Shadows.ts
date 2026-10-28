import { ViewStyle, Platform } from "react-native";

/**
 * V&V Reservas — Mobile Design System: Shadows & Elevation
 * Configuración multiplataforma: propiedades nativas de sombra para iOS y elevation para Android.
 */

export const Shadows: Record<"none" | "sm" | "md" | "lg" | "xl", ViewStyle> = {
  none: {
    ...Platform.select({
      ios: {
        shadowColor: "transparent",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
      default: {},
    }),
  },
  sm: {
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
      default: {
        shadowColor: "rgba(15, 23, 42, 0.05)",
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
      },
    }),
  },
  md: {
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      default: {
        shadowColor: "rgba(15, 23, 42, 0.08)",
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
      },
    }),
  },
  lg: {
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      default: {
        shadowColor: "rgba(15, 23, 42, 0.12)",
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 16,
      },
    }),
  },
  xl: {
    ...Platform.select({
      ios: {
        shadowColor: "#0F172A",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
      default: {
        shadowColor: "rgba(15, 23, 42, 0.16)",
        shadowOffset: { width: 0, height: 12 },
        shadowRadius: 24,
      },
    }),
  },
};

export default Shadows;
