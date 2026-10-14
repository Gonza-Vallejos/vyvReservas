/**
 * Themed primitives para V&V Reservas.
 * Extiende Text/View con los tokens semánticos del brief.
 */

import { Text as DefaultText, View as DefaultView } from "react-native";

import Colors from "@/constants/Colors";
import { useColorScheme } from "./useColorScheme";

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"];
export type ViewProps = ThemeProps & DefaultView["props"];

type ColorName =
  | "text"
  | "textSecondary"
  | "textMuted"
  | "background"
  | "surface"
  | "surfaceElevated"
  | "border"
  | "primary"
  | "primaryDark"
  | "accent"
  | "success"
  | "error"
  | "warning"
  | "tint";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
) {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  }
  return Colors[theme][colorName as keyof (typeof Colors)["light"]];
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function Surface(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "surface"
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}

export function SurfaceElevated(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "surfaceElevated"
  );

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}
