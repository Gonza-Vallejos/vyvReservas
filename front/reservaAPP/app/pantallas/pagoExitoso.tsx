import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { obtenerEstadoPago } from "../../services/pagoService";
import { useThemeColor } from "@/components/Themed";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const ULTIMA_RESERVA_ID_KEY = "ultimaReservaId";

export default function PagoExitosoScreen() {
  const params = useLocalSearchParams<{
    reserva_id?: string;
    external_reference?: string;
  }>();
  const router = useRouter();
  const { isLoading, userInfo, isLoggedIn } = useAuth();

  const [loading, setLoading] = useState(true);
  const [pagoData, setPagoData] = useState<any>(null);
  const [reservaId, setReservaId] = useState<string | undefined>(undefined);

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");
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
      } else {
        setLoading(false);
      }
    };

    if (!isLoading) {
      resolveReservaId();
    }
  }, [params, isLoading]);

  useEffect(() => {
    if (!reservaId || isLoading) return;

    let cancelled = false;
    const fetchEstado = async () => {
      try {
        const response = await obtenerEstadoPago(reservaId);
        if (!cancelled) setPagoData(response?.data || response);
      } catch (err) {
        console.warn("Error al obtener estado del pago:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchEstado();
    return () => {
      cancelled = true;
    };
  }, [reservaId, isLoading]);

  if (isLoading || !isLoggedIn || !userInfo) {
    return <Redirect href="/login" />;
  }

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loaderText, { color: textSecondary }]}>
          Procesando tu pago…
        </Text>
      </View>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        style={[styles.scroll, { backgroundColor: background }]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Card style={StyleSheet.flatten([styles.statusCard, { borderLeftColor: success }])}>
          <View style={styles.statusIconCircle}>
            <Ionicons name="checkmark-circle-outline" size={56} color={success} />
          </View>
          <Text style={[styles.statusTitle, { color: text }]} allowFontScaling>
            ¡Pago confirmado!
          </Text>
          <Text style={[styles.statusSubtitle, { color: textSecondary }]} allowFontScaling>
            Tu pago fue procesado correctamente. Tu lugar está asegurado.
          </Text>
        </Card>

        {pagoData && (
          <Card>
            <Text style={[styles.sectionTitle, { color: text }]} allowFontScaling>
              Resumen del pago
            </Text>
            <View style={styles.row}>
              <Text style={[styles.label, { color: textSecondary }]} allowFontScaling>
                Total abonado
              </Text>
              <Text style={[styles.value, { color: text }]} allowFontScaling>
                ARS ${(pagoData.total || 0).toLocaleString("es-AR")}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={[styles.label, { color: textSecondary }]} allowFontScaling>
                Estado
              </Text>
              <Badge variant="success">Pagado</Badge>
            </View>
          </Card>
        )}

        <View style={styles.actions}>
          <Button
            variant="primary"
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
            variant="secondary"
            size="lg"
            onPress={() => router.push("/(tabs)/reserva")}
            icon="list-outline"
            iconPosition="left"
          >
            Ver todas mis reservas
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onPress={() => router.push("/(tabs)/viajes")}
            icon="search-outline"
            iconPosition="left"
          >
            Buscar nuevos viajes
          </Button>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
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
    backgroundColor: "rgba(16,185,129,0.12)",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  value: {
    fontSize: 18,
    fontWeight: "900",
  },
  actions: {
    gap: 10,
  },
});
