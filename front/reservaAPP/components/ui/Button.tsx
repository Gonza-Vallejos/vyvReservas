import React, { useRef } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  PressableProps,
  ViewStyle,
  TextStyle,
  Animated,
  GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../Themed";
import { Layout, Radii, Spacing } from "@/constants/Spacing";
import { Shadows } from "@/constants/Shadows";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<PressableProps, "style"> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  pill?: boolean;
  fullWidth?: boolean;
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
  fullWidth = false,
  icon,
  iconPosition = "left",
  accessibilityLabel,
  accessibilityHint,
  style,
  textStyle,
  onPressIn,
  onPressOut,
  ...pressableProps
}: ButtonProps) {
  const primary = useThemeColor({}, "primary");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const text = useThemeColor({}, "text");
  const border = useThemeColor({}, "border");
  const error = useThemeColor({}, "error");

  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!isDisabled) {
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 40,
        bounciness: 4,
      }).start();
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    if (!isDisabled) {
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 4,
      }).start();
    }
    onPressOut?.(e);
  };

  const height =
    size === "sm" ? Layout.buttonHeightSm : size === "lg" ? Layout.buttonHeightLg : Layout.buttonHeightMd;
  const paddingHorizontal = size === "sm" ? Spacing.md : size === "lg" ? Spacing.xl : Spacing.base;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 17 : 15;
  const iconSize = size === "sm" ? 16 : size === "lg" ? 22 : 18;

  const backgroundColors: Record<ButtonVariant, string> = {
    primary,
    secondary: surfaceElevated,
    outline: "transparent",
    ghost: "transparent",
    destructive: error,
  };

  const borderColors: Record<ButtonVariant, string> = {
    primary,
    secondary: border,
    outline: primary,
    ghost: "transparent",
    destructive: error,
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: "#FFFFFF",
    secondary: text,
    outline: primary,
    ghost: primary,
    destructive: "#FFFFFF",
  };

  const shadowStyle = variant === "primary" && !isDisabled ? Shadows.sm : {};

  return (
    <AnimatedPressable
      {...pressableProps}
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityLabel={
        accessibilityLabel || (typeof children === "string" ? children : undefined)
      }
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        styles.base,
        shadowStyle,
        {
          minHeight: height,
          paddingHorizontal,
          borderRadius: pill ? Radii.full : Radii.md,
          backgroundColor: backgroundColors[variant],
          borderColor: borderColors[variant],
          width: fullWidth ? "100%" : undefined,
          opacity: isDisabled ? 0.5 : 1,
          transform: [{ scale }],
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" || variant === "destructive" ? "#FFFFFF" : primary}
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
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    minWidth: Layout.minTouchTarget,
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
