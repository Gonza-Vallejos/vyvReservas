import React from "react";
import { Text as RNText, TextProps as RNTextProps, StyleSheet, TextStyle } from "react-native";
import { useThemeColor } from "../Themed";
import { Typography as TypographyTokens } from "@/constants/Typography";

export interface CustomTextProps extends RNTextProps {
  children?: React.ReactNode;
  color?: "text" | "textSecondary" | "textMuted" | "primary" | "error" | "success" | "accent" | "textInverse";
  align?: "auto" | "left" | "right" | "center" | "justify";
  style?: TextStyle | TextStyle[];
}

/**
 * Display: Título de máximo impacto para pantallas de bienvenida/splash
 */
export function Display({ children, color = "text", align = "left", style, ...props }: CustomTextProps) {
  const textColor = useThemeColor({}, color);
  return (
    <RNText
      allowFontScaling
      style={[TypographyTokens.display, { color: textColor, textAlign: align }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * Title: Título principal de pantalla (Large Title)
 */
export function Title({ children, color = "text", align = "left", style, ...props }: CustomTextProps) {
  const textColor = useThemeColor({}, color);
  return (
    <RNText
      allowFontScaling
      style={[TypographyTokens.title1, { color: textColor, textAlign: align }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * Subtitle: Subtítulo para secciones o encabezados de grupo
 */
export function Subtitle({ children, color = "textSecondary", align = "left", style, ...props }: CustomTextProps) {
  const textColor = useThemeColor({}, color);
  return (
    <RNText
      allowFontScaling
      style={[TypographyTokens.title2, { color: textColor, textAlign: align }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * Headline: Encabezado semántico para tarjetas o elementos de lista
 */
export function Headline({ children, color = "text", align = "left", style, ...props }: CustomTextProps) {
  const textColor = useThemeColor({}, color);
  return (
    <RNText
      allowFontScaling
      style={[TypographyTokens.headline, { color: textColor, textAlign: align }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * Body: Texto principal de párrafo o contenido
 */
export function Body({ children, color = "text", align = "left", style, ...props }: CustomTextProps) {
  const textColor = useThemeColor({}, color);
  return (
    <RNText
      allowFontScaling
      style={[TypographyTokens.body, { color: textColor, textAlign: align }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * Caption: Leyendas, metadatos, fechas u horas
 */
export function Caption({ children, color = "textMuted", align = "left", style, ...props }: CustomTextProps) {
  const textColor = useThemeColor({}, color);
  return (
    <RNText
      allowFontScaling
      style={[TypographyTokens.caption, { color: textColor, textAlign: align }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * Label: Etiquetas de campos de formulario y botones
 */
export function Label({ children, color = "textSecondary", align = "left", style, ...props }: CustomTextProps) {
  const textColor = useThemeColor({}, color);
  return (
    <RNText
      allowFontScaling
      style={[TypographyTokens.callout, { color: textColor, textAlign: align }, style]}
      {...props}
    >
      {children}
    </RNText>
  );
}

/**
 * MoneyText: Formateo visual destacado para importes y precios
 */
export function MoneyText({
  amount,
  currency = "$",
  size = "lg",
  color = "text",
  style,
  ...props
}: CustomTextProps & { amount: number | string; currency?: string; size?: "sm" | "lg" }) {
  const textColor = useThemeColor({}, color);
  const token = size === "lg" ? TypographyTokens.priceLarge : TypographyTokens.priceSmall;
  const formatted = typeof amount === "number" ? amount.toLocaleString("es-AR") : amount;

  return (
    <RNText
      allowFontScaling
      style={[token, { color: textColor }, style]}
      {...props}
    >
      {currency} {formatted}
    </RNText>
  );
}

export default {
  Display,
  Title,
  Subtitle,
  Headline,
  Body,
  Caption,
  Label,
  MoneyText,
};
