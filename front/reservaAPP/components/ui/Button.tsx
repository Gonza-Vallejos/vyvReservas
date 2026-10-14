import React from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  PressableProps,
  ViewStyle,
  TextStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../Themed";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  pill?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  iconPosition?: "left" | "right";
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  pill = false,
  icon,
  iconPosition = "left",
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
  ...pressableProps
}: ButtonProps) {
  const primary = useThemeColor({}, "primary");
  const surface = useThemeColor({}, "surface");
  const textMuted = useThemeColor({}, "textMuted");
  const border = useThemeColor({}, "border");

  const isDisabled = disabled || loading;

  const height = size === "sm" ? 36 : size === "lg" ? 52 : 44;
  const paddingHorizontal = size === "sm" ? 14 : size === "lg" ? 28 : 20;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 17 : 15;
  const iconSize = size === "sm" ? 14 : size === "lg" ? 22 : 18;

  const backgroundColors: Record<ButtonVariant, string> = {
    primary: primary,
    secondary: surface,
    ghost: "transparent",
  };

  const borderColors: Record<ButtonVariant, string> = {
    primary: primary,
    secondary: border,
    ghost: "transparent",
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: "#FFFFFF",
    secondary: textMuted,
    ghost: primary,
  };

  return (
    <Pressable
      {...pressableProps}
      disabled={isDisabled}
      accessibilityLabel={
        accessibilityLabel || (typeof children === "string" ? children : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: height,
          paddingHorizontal,
          borderRadius: pill ? 9999 : 12,
          backgroundColor: backgroundColors[variant],
          borderColor: borderColors[variant],
          opacity: isDisabled ? 0.5 : pressed ? 0.92 : 1,
          transform: pressed && !isDisabled ? [{ scale: 0.98 }] : [{ scale: 1 }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#FFFFFF" : primary}
          accessibilityHint="Cargando"
        />
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={textColors[variant]}
              style={styles.iconLeft}
            />
          )}
          <Text
            allowFontScaling
            style={[
              styles.text,
              {
                color: textColors[variant],
                fontSize,
              },
              textStyle,
            ]}
          >
            {children}
          </Text>
          {icon && iconPosition === "right" && (
            <Ionicons
              name={icon}
              size={iconSize}
              color={textColors[variant]}
              style={styles.iconRight}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minWidth: 44,
  },
  text: {
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
