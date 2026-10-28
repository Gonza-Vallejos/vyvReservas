import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ViewStyle,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../Themed";
import { withOpacity } from "@/constants/Colors";
import { Radii, Spacing } from "@/constants/Spacing";

export type FeedbackType = "error" | "warning" | "success" | "info";

export interface FeedbackBannerProps {
  type?: FeedbackType;
  message: string;
  title?: string;
  onDismiss?: () => void;
  style?: ViewStyle;
}

export default function FeedbackBanner({
  type = "info",
  message,
  title,
  onDismiss,
  style,
}: FeedbackBannerProps) {
  const errorColor = useThemeColor({}, "error");
  const warningColor = useThemeColor({}, "warning");
  const successColor = useThemeColor({}, "success");
  const primaryColor = useThemeColor({}, "primary");
  const text = useThemeColor({}, "text");

  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-6)).current;
  const shakeX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in + slide
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    // Sutil shake para errores
    if (type === "error") {
      Animated.sequence([
        Animated.timing(shakeX, { toValue: -5, duration: 40, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 5, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: -3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 3, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeX, { toValue: 0, duration: 40, useNativeDriver: true }),
      ]).start();
    }
  }, [message, type]);

  const config: Record<
    FeedbackType,
    { color: string; icon: keyof typeof Ionicons.glyphMap; defaultTitle: string }
  > = {
    error: {
      color: errorColor,
      icon: "alert-circle",
      defaultTitle: "Error",
    },
    warning: {
      color: warningColor,
      icon: "warning",
      defaultTitle: "Atención",
    },
    success: {
      color: successColor,
      icon: "checkmark-circle",
      defaultTitle: "Éxito",
    },
    info: {
      color: primaryColor,
      icon: "information-circle",
      defaultTitle: "Información",
    },
  };

  const current = config[type];

  return (
    <Animated.View
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      style={[
        styles.banner,
        {
          backgroundColor: withOpacity(current.color, 0.08),
          borderColor: withOpacity(current.color, 0.25),
          opacity,
          transform: [{ translateY }, { translateX: shakeX }],
        },
        style,
      ]}
    >
      <Ionicons
        name={current.icon}
        size={20}
        color={current.color}
        style={styles.icon}
      />
      <View style={styles.content}>
        {title && (
          <Text style={[styles.title, { color: current.color }]}>
            {title}
          </Text>
        )}
        <Text style={[styles.message, { color: text }]}>{message}</Text>
      </View>
      {onDismiss && (
        <Pressable
          onPress={onDismiss}
          hitSlop={8}
          accessibilityLabel="Cerrar notificación"
          style={styles.closeButton}
        >
          <Ionicons name="close" size={18} color={current.color} />
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: Radii.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  icon: {
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 2,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  closeButton: {
    padding: 2,
    marginLeft: Spacing.xs,
  },
});
