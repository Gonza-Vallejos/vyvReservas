/**
 * V&V Reservas — Mobile Design System: Spacing & Layout Tokens
 * Basado en una cuadrícula armónica de 4pt/8pt.
 * Asegura objetivos táctiles accesibles (mínimo 44pt iOS / 48dp Android).
 */

export const Spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 40,
  "4xl": 48,
  "5xl": 64,
};

export const Radii = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  full: 9999,
};

export const Layout = {
  // Dimensiones táctiles mínimas para botones, inputs e íconos interactivos
  minTouchTarget: 48,
  // Relleno horizontal estándar para vistas
  screenPadding: 16,
  // Relleno de modales y hojas inferiores
  sheetPadding: 24,
  // Altura estándar de barra de navegación
  headerHeight: 56,
  // Altura estándar de campos de texto
  inputHeight: 48,
  // Altura estándar de botones
  buttonHeightSm: 36,
  buttonHeightMd: 48,
  buttonHeightLg: 54,
};

export default {
  Spacing,
  Radii,
  Layout,
};
