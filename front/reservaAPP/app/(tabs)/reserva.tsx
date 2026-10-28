import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { Redirect, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { obtenerReservas, eliminarReserva } from "../../services/reservaService";
import { crearPreferencia } from "../../services/pagoService";
import { useThemeColor } from "@/components/Themed";
import { useFocusEffect } from "@react-navigation/native";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

const CANCEL_HOURS_LIMIT = 2;
const ULTIMA_RESERVA_ID_KEY = "ultimaReservaId";

interface Trip {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  horarioSalida: string;
  fechaViaje: string;
  precio: number;
}

interface Passenger {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
}

interface Reservation {
  id: number;
  fechaReserva: string;
  estado?: string;
  estadoPago?: string;
  codigoReserva?: string;
  total?: number;
  viaje?: Trip;
  Viaje?: Trip;
  pasajeros?: Passenger[];
  Pasajeros?: Passenger[];
}

const getTrip = (reserva: Reservation) => reserva?.viaje || reserva?.Viaje || ({} as Trip);
const getPassengers = (reserva: Reservation) =>
  reserva?.pasajeros || reserva?.Pasajeros || [];

const formatCurrency = (value: number) =>
  Number(value || 0).toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const parseDeparture = (trip: Trip) => {
  if (!trip?.fechaViaje) return null;
  const fecha = String(trip.fechaViaje).split("T")[0];
  const [year, month, day] = fecha.split("-").map((n) => parseInt(n, 10));
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (trip.horarioSalida) {
    const [hours, minutes] = String(trip.horarioSalida).split(":");
    if (hours && minutes) {
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }
  }
  return date;
};

const classifyReservation = (reserva: Reservation) => {
  const trip = getTrip(reserva);
  const departure = parseDeparture(trip);
  const now = new Date();
  const estado = String(reserva?.estado || "").toLowerCase();
  const estadoPago = String(reserva?.estadoPago || "").toLowerCase();

  const isCancelled = estado === "cancelada";
  const isPaid =
    estadoPago === "pagado" || estado === "pagado" || estado === "pagada";
  const isPending = estado === "pendiente" || estadoPago === "pendiente";
  const isConfirmed = estado === "confirmada";
  const isPast = departure ? departure <= now : false;
  const needsPayment = isPending || (isConfirmed && !isPaid);

  return { isCancelled, isPaid, isPending, isConfirmed, isPast, departure, needsPayment };
};

const statusBadgeProps = (reserva: Reservation) => {
  const estado = String(reserva?.estado || "").toLowerCase();
  const estadoPago = String(reserva?.estadoPago || "").toLowerCase();

  if (estado === "cancelada") return { variant: "error" as const, label: "Cancelada" };
  if (estadoPago === "pagado" || estado === "pagado" || estado === "pagada")
    return { variant: "success" as const, label: "Pagada" };
  if (estado === "pendiente" || estadoPago === "pendiente")
    return { variant: "warning" as const, label: "Pendiente de pago" };
  if (estado === "confirmada") return { variant: "success" as const, label: "Confirmada" };
  return { variant: "default" as const, label: reserva?.estado || "Reserva" };
};

export default function MisReservasScreen() {
  const { userInfo, isLoading: authLoading, isLoggedIn } = useAuth();
  const [reservas, setReservas] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");
  const warning = useThemeColor({}, "warning");
  const errorColor = useThemeColor({}, "error");
  const background = useThemeColor({}, "background");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");

  const isCliente =
    !userInfo ||
    userInfo.perfil === "usuarioCliente" ||
    userInfo.perfil === "cliente" ||
    userInfo.perfil_id === 2;

  if (!authLoading && !isCliente) {
    return <Redirect href="/(tabs)" />;
  }

  const fetchReservas = useCallback(async () => {
    if (!userInfo?.id) {
      setError("No se pudo obtener el ID del usuario");
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await obtenerReservas(userInfo.id);
      const list = Array.isArray(data) ? data : data?.data || [];
      setReservas(Array.isArray(list) ? list : []);
    } catch {
      setError("No pudimos cargar tus reservas. Intentá de nuevo en unos instantes.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userInfo?.id]);

  useFocusEffect(
    useCallback(() => {
      if (!authLoading && isLoggedIn) {
        fetchReservas();
      }
    }, [authLoading, isLoggedIn, fetchReservas])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReservas();
  };

  const grouped = useMemo(() => {
    const upcoming: Reservation[] = [];
    const pending: Reservation[] = [];
    const history: Reservation[] = [];

    reservas.forEach((reserva) => {
      const { isCancelled, isPaid, isPending, isPast } = classifyReservation(reserva);
      if (isCancelled || isPast) {
        history.push(reserva);
      } else if (isPending) {
        pending.push(reserva);
      } else if (isPaid) {
        upcoming.push(reserva);
      } else {
        upcoming.push(reserva);
      }
    });

    const sortByDeparture = (a: Reservation, b: Reservation, direction: "asc" | "desc" = "asc") => {
      const da = parseDeparture(getTrip(a));
      const db = parseDeparture(getTrip(b));
      if (!da || !db) return 0;
      return direction === "asc" ? da.getTime() - db.getTime() : db.getTime() - da.getTime();
    };

    upcoming.sort((a, b) => sortByDeparture(a, b, "asc"));
    pending.sort((a, b) => sortByDeparture(a, b, "asc"));
    history.sort((a, b) => sortByDeparture(a, b, "desc"));

    return { upcoming, pending, history };
  }, [reservas]);

  const canCancel = (reserva: Reservation) => {
    const { isCancelled, isPast, departure } = classifyReservation(reserva);
    if (isCancelled || isPast || !departure) return false;
    const limit = new Date(departure.getTime() - CANCEL_HOURS_LIMIT * 60 * 60 * 1000);
    return new Date() <= limit;
  };

  const handlePayment = async (reserva: Reservation) => {
    setPayingId(reserva.id);
    try {
      await AsyncStorage.setItem(ULTIMA_RESERVA_ID_KEY, String(reserva.id));
      const response = await crearPreferencia(reserva.id);
      const { initPoint } = response?.data || response || {};
      if (initPoint) {
        Linking.openURL(initPoint);
      } else {
        Alert.alert("Error", "No se pudo generar el link de pago");
      }
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.response?.data?.mensaje || "Error al iniciar el pago";
      Alert.alert("Error", message);
    } finally {
      setPayingId(null);
    }
  };

  const handleView = (reserva: Reservation) => {
    router.push({
      pathname: "/pantallas/confirmarReserva",
      params: {
        reservaId: String(reserva.id),
      },
    });
  };

  const handleCancel = (reserva: Reservation) => {
    const trip = getTrip(reserva);
    const departure = parseDeparture(trip);

    const confirm = async () => {
      setCancellingId(reserva.id);
      try {
        await eliminarReserva(reserva.id);
        setReservas((prev) =>
          prev.map((r) =>
            r.id === reserva.id ? { ...r, estado: "Cancelada", estadoPago: "Cancelada" } : r
          )
        );
        Alert.alert("Reserva cancelada", "La reserva fue cancelada correctamente.");
      } catch (err: any) {
        const message =
          err?.response?.data?.mensaje || err?.response?.data?.message || "No se pudo cancelar la reserva";
        Alert.alert("Error", message);
      } finally {
        setCancellingId(null);
      }
    };

    if (Platform.OS === "web") {
      const msg = `¿Cancelar la reserva de ${trip.origenLocalidad} a ${trip.destinoLocalidad}?`;
      if (window.confirm(msg)) confirm();
    } else {
      Alert.alert(
        "¿Cancelar esta reserva?",
        `Vas a cancelar el viaje de ${trip.origenLocalidad} a ${trip.destinoLocalidad}${
          departure
            ? ` del ${departure.toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "long",
              })} a las ${trip.horarioSalida?.substring(0, 5)} hs`
            : ""
        }. Esta acción no se puede deshacer.`,
        [
          { text: "Volver", style: "cancel" },
          { text: "Sí, cancelar", style: "destructive", onPress: confirm },
        ]
      );
    }
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.loader, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loaderText, { color: textSecondary }]}>Cargando reservas…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <ScreenContainer scrollEnabled={false}>
        <EmptyState
          icon="alert-circle-outline"
          title="No pudimos cargar tus reservas"
          description={error}
          action={{
            label: "Reintentar",
            onPress: fetchReservas,
          }}
        />
      </ScreenContainer>
    );
  }

  const totalCount = grouped.upcoming.length + grouped.pending.length + grouped.history.length;

  const renderSection = (
    title: string,
    data: Reservation[],
    variant: "success" | "warning" | "default"
  ) => {
    if (data.length === 0) return null;
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: text }]} allowFontScaling>
            {title}
          </Text>
          <Badge variant={variant}>{data.length}</Badge>
        </View>
        {data.map((reserva) => (
          <ReservationCard
            key={reserva.id}
            reserva={reserva}
            onPay={handlePayment}
            onView={handleView}
            onCancel={handleCancel}
            canCancel={canCancel(reserva)}
            cancellingId={cancellingId}
            payingId={payingId}
          />
        ))}
      </View>
    );
  };

  return (
    <ScreenContainer scrollEnabled={false}>
      <ScrollView
        style={[styles.scroll, { backgroundColor: background }]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={primary} />
        }
      >
        <View style={styles.pageHeader}>
          <View style={[styles.headerIconCircle, { backgroundColor: `${primary}12` }]}>
            <Ionicons name="ticket-outline" size={28} color={primary} />
          </View>
          <View>
            <Text style={[styles.pageTitle, { color: text }]} allowFontScaling>
              Mis Reservas
            </Text>
            <Text style={[styles.pageSubtitle, { color: textSecondary }]} allowFontScaling>
              {totalCount === 0
                ? "Todavía no tenés reservas activas"
                : `Tenés ${totalCount} ${totalCount === 1 ? "reserva" : "reservas"} en total`}
            </Text>
          </View>
        </View>

        {totalCount === 0 ? (
          <EmptyState
            icon="ticket-outline"
            title="Aún no tenés reservas"
            description="Cuando reserves tu próximo viaje, vas a encontrarlo acá. Busca pasajes y reservá en segundos."
            action={{
              label: "Buscar mi primer viaje",
              onPress: () => router.push("/(tabs)/viajes"),
            }}
          />
        ) : (
          <>
            {renderSection("Próximos confirmados", grouped.upcoming, "success")}
            {renderSection("Pendientes de pago", grouped.pending, "warning")}
            {renderSection("Finalizados / Cancelados", grouped.history, "default")}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

function ReservationCard({
  reserva,
  onPay,
  onView,
  onCancel,
  canCancel,
  cancellingId,
  payingId,
}: {
  reserva: Reservation;
  onPay: (reserva: Reservation) => void;
  onView: (reserva: Reservation) => void;
  onCancel: (reserva: Reservation) => void;
  canCancel: boolean;
  cancellingId: number | null;
  payingId: number | null;
}) {
  const trip = getTrip(reserva);
  const passengers = getPassengers(reserva);
  const { isPaid, needsPayment } = classifyReservation(reserva);
  const status = statusBadgeProps(reserva);
  const departure = parseDeparture(trip);
  const total = reserva.total || trip.precio * (passengers.length || 1) || 0;

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");
  const warning = useThemeColor({}, "warning");
  const errorColor = useThemeColor({}, "error");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <Badge variant={status.variant}>{status.label}</Badge>
        {cancellingId === reserva.id && (
          <Text style={[styles.cancellingText, { color: textMuted }]}>Cancelando…</Text>
        )}
      </View>

      <View style={styles.routeRow}>
        <View style={styles.location}>
          <Ionicons name="location" size={18} color={primary} />
          <View>
            <Text style={[styles.locationLabel, { color: textSecondary }]} allowFontScaling>
              Origen
            </Text>
            <Text style={[styles.locationName, { color: text }]} allowFontScaling>
              {trip.origenLocalidad || "No disponible"}
            </Text>
          </View>
        </View>
        <View style={styles.routeConnector}>
          <View style={[styles.routeLine, { backgroundColor: surfaceElevated }]} />
          <Ionicons name="chevron-forward" size={14} color={textMuted} />
        </View>
        <View style={styles.location}>
          <Ionicons name="location" size={18} color={warning} />
          <View>
            <Text style={[styles.locationLabel, { color: textSecondary }]} allowFontScaling>
              Destino
            </Text>
            <Text style={[styles.locationName, { color: text }]} allowFontScaling>
              {trip.destinoLocalidad || "No disponible"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={[styles.detailPill, { backgroundColor: surfaceElevated }]}>
          <Ionicons name="calendar-outline" size={14} color={textSecondary} />
          <Text style={[styles.detailText, { color: textSecondary }]} allowFontScaling>
            {departure
              ? departure.toLocaleDateString("es-AR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "short",
                })
              : "Fecha no disp."}
          </Text>
        </View>
        <View style={[styles.detailPill, { backgroundColor: surfaceElevated }]}>
          <Ionicons name="time-outline" size={14} color={textSecondary} />
          <Text style={[styles.detailText, { color: textSecondary }]} allowFontScaling>
            {trip.horarioSalida?.substring(0, 5) || "--:--"} hs
          </Text>
        </View>
        <View style={[styles.detailPill, { backgroundColor: surfaceElevated }]}>
          <Ionicons name="people-outline" size={14} color={textSecondary} />
          <Text style={[styles.detailText, { color: textSecondary }]} allowFontScaling>
            {passengers.length} pasajero{passengers.length !== 1 ? "s" : ""}
          </Text>
        </View>
      </View>

      {passengers.length > 0 && (
        <View style={styles.passengersRow}>
          <Text style={[styles.passengersLabel, { color: textSecondary }]} allowFontScaling>
            Pasajeros
          </Text>
          <View style={styles.passengersList}>
            {passengers.slice(0, 3).map((p, idx) => (
              <View key={p.id || idx} style={[styles.passengerChip, { backgroundColor: surfaceElevated }]}>
                <Text style={[styles.passengerChipText, { color: textSecondary }]} allowFontScaling>
                  {p.nombre} {p.apellido}
                </Text>
              </View>
            ))}
            {passengers.length > 3 && (
              <View style={[styles.passengerChip, { backgroundColor: surfaceElevated }]}>
                <Text style={[styles.passengerChipText, { color: textSecondary }]} allowFontScaling>
                  +{passengers.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: surfaceElevated }]} />

      <View style={styles.footer}>
        <Text style={[styles.total, { color: text }]} allowFontScaling>
          {formatCurrency(total)}
        </Text>
        <View style={styles.actions}>
          <Button
            variant="ghost"
            size="sm"
            onPress={() => onView(reserva)}
            icon="eye-outline"
            iconPosition="left"
          >
            Detalle
          </Button>

          {needsPayment && (
            <Button
              variant="primary"
              size="sm"
              loading={payingId === reserva.id}
              disabled={payingId === reserva.id}
              onPress={() => onPay(reserva)}
              icon="card-outline"
              iconPosition="left"
            >
              Pagar
            </Button>
          )}

          {isPaid && (
            <Button
              variant="secondary"
              size="sm"
              onPress={() => onView(reserva)}
              icon="download-outline"
              iconPosition="left"
            >
              Boleto
            </Button>
          )}

          {canCancel && (
            <Button
              variant="secondary"
              size="sm"
              onPress={() => onCancel(reserva)}
              disabled={cancellingId === reserva.id}
              icon="close-outline"
              iconPosition="left"
            >
              Cancelar
            </Button>
          )}
        </View>
      </View>
    </Card>
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
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 20,
  },
  headerIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "900",
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  card: {
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cancellingText: {
    fontSize: 13,
    fontWeight: "700",
  },
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  location: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  locationLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  locationName: {
    fontSize: 15,
    fontWeight: "800",
  },
  routeConnector: {
    flex: 0.4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  routeLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    marginRight: 2,
  },
  detailsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  detailPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  detailText: {
    fontSize: 12,
    fontWeight: "700",
  },
  passengersRow: {
    marginBottom: 14,
  },
  passengersLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  passengersList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  passengerChip: {
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  passengerChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  total: {
    fontSize: 20,
    fontWeight: "900",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
});
