import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useThemeColor } from "../Themed";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "accent";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  style?: ViewStyle;
  allowFontScaling?: boolean;
}

export default function Badge({
  children,
  variant = "default",
  style,
  allowFontScaling = true,
}: BadgeProps) {
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");
  const warning = useThemeColor({}, "warning");
  const error = useThemeColor({}, "error");
  const accent = useThemeColor({}, "accent");
  const text = useThemeColor({}, "text");
  const surface = useThemeColor({}, "surface");
  const textSecondary = useThemeColor({}, "textSecondary");

  const variants: Record<
    BadgeVariant,
    { background: string; color: string; border: string }
  > = {
    default: {
      background: surface,
      color: textSecondary,
      border: useThemeColor({}, "border"),
    },
    primary: {
      background: `${primary}15`,
      color: primary,
      border: `${primary}30`,
    },
    secondary: {
      background: useThemeColor({}, "surfaceElevated"),
      color: textSecondary,
      border: useThemeColor({}, "border"),
    },
    success: {
      background: `${success}15`,
      color: success,
      border: `${success}30`,
    },
    warning: {
      background: `${warning}15`,
      color: warning,
      border: `${warning}30`,
    },
    error: {
      background: `${error}15`,
      color: error,
      border: `${error}30`,
    },
    accent: {
      background: `${accent}15`,
      color: accent,
      border: `${accent}30`,
    },
  };

  const theme = variants[variant];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: theme.background,
          borderColor: theme.border,
        },
        style,
      ]}
    >
      <Text
        allowFontScaling={allowFontScaling}
        style={[styles.text, { color: theme.color }]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
