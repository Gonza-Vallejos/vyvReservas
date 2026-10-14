import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../Themed";
import Button from "./Button";

interface ScreenContainerProps {
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  scrollEnabled?: boolean;
}

/**
 * Contenedor de pantalla reutilizable.
 * Maneja estados de carga, error y pull-to-refresh.
 */
export default function ScreenContainer({
  children,
  loading = false,
  error = null,
  onRetry,
  refreshing = false,
  onRefresh,
  style,
  contentContainerStyle,
  scrollEnabled = true,
}: ScreenContainerProps) {
  const primary = useThemeColor({}, "primary");
  const textSecondary = useThemeColor({}, "textSecondary");

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, style]}>
        <Text style={[styles.loadingText, { color: textSecondary }]}>
          Cargando…
        </Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={[styles.center, style]}>
        <Ionicons
          name="alert-circle-outline"
          size={48}
          color={useThemeColor({}, "error")}
        />
        <Text style={[styles.errorText, { color: textSecondary }]}>{error}</Text>
        {onRetry && (
          <Button variant="primary" size="sm" onPress={onRetry} style={styles.retryButton}>
            Reintentar
          </Button>
        )}
      </View>
    );
  }

  const refreshControl = onRefresh ? (
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />
  ) : undefined;

  if (scrollEnabled) {
    return (
      <ScrollView
        style={[styles.container, style]}
        contentContainerStyle={contentContainerStyle}
        refreshControl={refreshControl}
      >
        {children}
      </ScrollView>
    );
  }

  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
  },
  retryButton: {
    marginTop: 16,
  },
});
