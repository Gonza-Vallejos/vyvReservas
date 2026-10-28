import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from "react-native";
import { useThemeColor } from "../Themed";
import { Radii, Spacing } from "@/constants/Spacing";
import { Shadows } from "@/constants/Shadows";

export type CardVariant = "elevated" | "outlined" | "flat";

interface CardBaseProps {
  children: React.ReactNode;
  variant?: CardVariant;
  style?: ViewStyle;
  padded?: boolean;
}

export type CardProps =
  | (CardBaseProps & { onPress?: undefined; pressableProps?: never })
  | (CardBaseProps & {
      onPress: () => void;
      pressableProps?: Omit<PressableProps, "onPress" | "style">;
    });

export default function Card({
  children,
  variant = "elevated",
  style,
  padded = true,
  onPress,
  pressableProps,
}: CardProps) {
  const surface = useThemeColor({}, "surface");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const border = useThemeColor({}, "border");

  const variantStyles: Record<CardVariant, ViewStyle> = {
    elevated: {
      backgroundColor: surface,
      borderColor: border,
      borderWidth: 1,
      ...Shadows.sm,
    },
    outlined: {
      backgroundColor: surface,
      borderColor: border,
      borderWidth: 1,
    },
    flat: {
      backgroundColor: surfaceElevated,
      borderWidth: 0,
    },
  };

  const cardStyle: ViewStyle[] = [
    styles.card,
    variantStyles[variant],
    {
      padding: padded ? Spacing.base : 0,
    },
    style || {},
  ];

  if (onPress) {
    return (
      <Pressable
        {...pressableProps}
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          ...cardStyle,
          {
            opacity: pressed ? 0.95 : 1,
            transform: pressed ? [{ scale: 0.992 }] : [{ scale: 1 }],
          },
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radii.lg,
    overflow: "hidden",
  },
});
