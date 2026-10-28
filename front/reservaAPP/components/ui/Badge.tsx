import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../Themed";
import { withOpacity } from "@/constants/Colors";
import { Radii, Spacing } from "@/constants/Spacing";

export type BadgeVariant =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "accent"
  | "neutral";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  icon?: keyof typeof Ionicons.glyphMap;
  showDot?: boolean;
  size?: "sm" | "md";
  style?: ViewStyle;
  allowFontScaling?: boolean;
}

export default function Badge({
  children,
  variant = "default",
  icon,
  showDot = false,
  size = "md",
  style,
  allowFontScaling = true,
}: BadgeProps) {
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");
  const warning = useThemeColor({}, "warning");
  const error = useThemeColor({}, "error");
  const accent = useThemeColor({}, "accent");
  const textSecondary = useThemeColor({}, "textSecondary");
  const surface = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");

  const colorMap: Record<BadgeVariant, { bg: string; text: string; border: string }> = {
    default: {
      bg: surfaceElevated,
      text: textSecondary,
      border: border,
    },
    neutral: {
      bg: surfaceElevated,
      text: textSecondary,
      border: border,
    },
    primary: {
      bg: withOpacity(primary, 0.12),
      text: primary,
      border: withOpacity(primary, 0.25),
    },
    secondary: {
      bg: surfaceElevated,
      text: textSecondary,
      border: border,
    },
    success: {
      bg: withOpacity(success, 0.12),
      text: success,
      border: withOpacity(success, 0.25),
    },
    warning: {
      bg: withOpacity(warning, 0.12),
      text: warning,
      border: withOpacity(warning, 0.25),
    },
    error: {
      bg: withOpacity(error, 0.12),
      text: error,
      border: withOpacity(error, 0.25),
    },
    accent: {
      bg: withOpacity(accent, 0.12),
      text: accent,
      border: withOpacity(accent, 0.25),
    },
  };

  const currentTheme = colorMap[variant] || colorMap.default;
  const isSmall = size === "sm";

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: currentTheme.bg,
          borderColor: currentTheme.border,
          paddingHorizontal: isSmall ? Spacing.sm : Spacing.md,
          paddingVertical: isSmall ? 2 : Spacing.xs,
        },
        style,
      ]}
    >
      {showDot && (
        <View style={[styles.dot, { backgroundColor: currentTheme.text }]} />
      )}
      {icon && (
        <Ionicons
          name={icon}
          size={isSmall ? 10 : 12}
          color={currentTheme.text}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        allowFontScaling={allowFontScaling}
        style={[
          styles.text,
          {
            color: currentTheme.text,
            fontSize: isSmall ? 10 : 11,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radii.full,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
