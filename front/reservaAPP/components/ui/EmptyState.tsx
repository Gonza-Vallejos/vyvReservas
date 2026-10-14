import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../Themed";
import Button from "./Button";

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onPress: () => void;
    variant?: "primary" | "secondary" | "ghost";
  };
  style?: ViewStyle;
}

export default function EmptyState({
  icon = "search-outline",
  title = "No hay resultados",
  description = "Probá con otros filtros o fechas.",
  action,
  style,
}: EmptyStateProps) {
  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");

  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
    >
      <View style={[styles.iconCircle, { backgroundColor: `${useThemeColor({}, "primary")}12` }]}>
        <Ionicons
          name={icon}
          size={32}
          color={useThemeColor({}, "primary")}
        />
      </View>
      <Text
        allowFontScaling
        style={[styles.title, { color: text }]}
      >
        {title}
      </Text>
      {description && (
        <Text
          allowFontScaling
          style={[styles.description, { color: textSecondary }]}
        >
          {description}
        </Text>
      )}
      {action && (
        <View style={styles.action}>
          <Button
            variant={action.variant || "primary"}
            onPress={action.onPress}
            accessibilityLabel={action.label}
          >
            {action.label}
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    minHeight: 220,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
    marginBottom: 16,
  },
  action: {
    minWidth: 160,
  },
});
