import { TextStyle, Platform } from "react-native";

/**
 * V&V Reservas — Mobile Design System: Typography Scale
 * Basado en las directrices nativas de iOS (Human Interface Guidelines)
 * y Android Material 3, garantizando legibilidad y soporte Dynamic Type.
 */

export const FontWeights = {
  regular: "400" as TextStyle["fontWeight"],
  medium: "500" as TextStyle["fontWeight"],
  semibold: "600" as TextStyle["fontWeight"],
  bold: "700" as TextStyle["fontWeight"],
  heavy: "800" as TextStyle["fontWeight"],
};

export const Typography: Record<string, TextStyle> = {
  // Grandes títulos de bienvenida o pantallas hero
  display: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: FontWeights.heavy,
    letterSpacing: Platform.OS === "ios" ? -0.5 : 0,
  },
  // Título principal de pantalla (Large Title)
  title1: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: FontWeights.bold,
    letterSpacing: Platform.OS === "ios" ? -0.3 : 0,
  },
  // Subtítulos o secciones principales dentro de una pantalla
  title2: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: FontWeights.bold,
    letterSpacing: Platform.OS === "ios" ? -0.2 : 0,
  },
  // Encabezados de tarjetas y agrupadores
  headline: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: FontWeights.semibold,
  },
  // Texto de lectura principal (estándar nativo)
  body: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: FontWeights.regular,
  },
  // Texto secundario, botones o llamadas a la acción
  callout: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: FontWeights.medium,
  },
  // Metadatos, fechas, horas y textos secundarios
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: FontWeights.medium,
    letterSpacing: Platform.OS === "ios" ? 0.2 : 0.1,
  },
  // Badges, estados y microetiquetas
  captionSmall: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: FontWeights.bold,
    letterSpacing: 0.3,
  },
  // Números monetarios y precios destacados
  priceLarge: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: FontWeights.heavy,
    letterSpacing: -0.3,
  },
  priceSmall: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: FontWeights.bold,
  },
};

export default Typography;
