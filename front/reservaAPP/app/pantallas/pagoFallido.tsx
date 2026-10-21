import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { obtenerEstadoPago, crearPreferencia } from "../../services/pagoService";
import { useThemeColor } from "@/components/Themed";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

const ULTIMA_RESERVA_ID_KEY = "ultimaReservaId";

export default function PagoFallidoScreen() {
  const params = useLocalSearchParams<{
    reserva_id?: string;
    external_reference?: string;
  }>();
  const router = useRouter();
  const { isLoading, userInfo, isLoggedIn } = useAuth();

  const [reservaId, setReservaId] = useState<string | undefined>(undefined);
  const [checking, setChecking] = useState(false);

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");
  const warning = useThemeColor({}, "warning");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const background = useThemeColor({}, "background");

  useEffect(() => {
    const resolveReservaId = async () => {
      let id: string | null | undefined = params.reserva_id;
      if (!id) {
        id = await AsyncStorage.getItem(ULTIMA_RESERVA_ID_KEY);
      }
      if (!id && params.external_reference) {
        const match = String(params.external_reference).match(/RESERVA-(\d+)/);
        if (match) id = match[1];
      }
      if (id) {
        await AsyncStorage.setItem(ULTIMA_RESERVA_ID_KEY, id);
        setReservaId(id);
      }
    };

    if (!isLoading) {
      resolveReservaId();
    }
  }, [params, isLoading]);

  const handleReintentar = async () => {
    if (!reservaId) {
      Alert.alert("Error", "No encontramos la reserva");
      return;
    }

    setChecking(true);
    try {
      const estadoRes = await obtenerEstadoPago(reservaId);
      const estado = estadoRes?.data || estadoRes;
      if (estado?.pagado) {
        Alert.alert("Listo", "¡El pago ya está confirmado!");
        router.push({
          pathname: "/pantallas/confirmarReserva",
          params: { reservaId },
        });
        return;
      }

      const prefResponse = await crearPreferencia(reservaId);
      const { initPoint } = prefResponse?.data || prefResponse || {};
      if (initPoint) {
        Linking.openURL(initPoint);
      } else {
        Alert.alert("Error", "No se pudo generar el link de pago");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.response?.data?.mensaje || "Error al intentar novamente";
      Alert.alert("Error", message);
    } finally {
      setChecking(false);
    }
  };

  if (isLoading || !isLoggedIn || !userInfo) {
    return <Redirect href="/login" />;
  }

  return (
    <ScreenContainer>
      <ScrollView
        style={[styles.scroll, { backgroundColor: background }]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Card style={StyleSheet.flatten([styles.statusCard, { borderLeftColor: warning }])}>
          <View style={styles.statusIconCircle}>
            <Ionicons name="close-circle-outline" size={56} color={warning} />
          </View>
          <Text style={[styles.statusTitle, { color: text }]} allowFontScaling>
            Pago no completado
          </Text>
          <Text style={[styles.statusSubtitle, { color: textSecondary }]} allowFontScaling>
            El pago no se completó. Podés reintentar o volver al inicio.
          </Text>
        </Card>

        <Card>
          <View style={styles.infoRow}>
            <Ionicons name="alert-circle-outline" size={26} color={textMuted} />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, { color: text }]} allowFontScaling>
                ¿Qué pasó?
              </Text>
              <Text style={[styles.infoBody, { color: textSecondary }]} allowFontScaling>
                El pago puede haber sido cancelado, rechazado o expiró el tiempo de espera. Tu
                lugar sigue reservado y podés reintentar el pago cuando quieras.
              </Text>
            </View>
          </View>
        </Card>

        <View style={styles.actions}>
          {reservaId && (
            <Button
              variant="primary"
              size="lg"
              loading={checking}
              disabled={checking}
              onPress={handleReintentar}
              icon="refresh-outline"
              iconPosition="left"
            >
              Reintentar pago
            </Button>
          )}

          <Button
            variant="secondary"
            size="lg"
            onPress={() =>
              router.push({
                pathname: "/pantallas/confirmarReserva",
                params: { reservaId: reservaId || "nueva" },
              })
            }
            icon="ticket-outline"
            iconPosition="left"
          >
            Ver mi reserva
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onPress={() => router.push("/(tabs)")}
            icon="home-outline"
            iconPosition="left"
          >
            Volver al inicio
          </Button>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  statusCard: {
    alignItems: "center",
    borderLeftWidth: 6,
  },
  statusIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(249,115,22,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 8,
    textAlign: "center",
  },
  statusSubtitle: {
    fontSize: 15,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 21,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  infoBody: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  actions: {
    gap: 10,
  },
});
