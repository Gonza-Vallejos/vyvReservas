import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView,
  Linking,
} from "react-native";
import { Redirect, router, useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import {
  listarReservasYPasajerosPorViaje,
  eliminarPasajero,
  obtenerReservas,
} from "../../services/reservaService";
import { existeReservaVenta } from "../../services/ventaService";
import { crearPreferencia } from "../../services/pagoService";
import { useAuth } from "../../context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useThemeColor } from "@/components/Themed";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { formatDate } from "@/utils/dateFormatter";
import EmptyState from "@/components/ui/EmptyState";

export interface Pasajero {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
}

export interface ReservaConPasajeros {
  reservaId: number;
  fechaReserva: string;
  usuarios_id: number;
  pasajeros: Pasajero[];
  tieneVenta?: boolean;
}

interface Reservation {
  id: number;
  fechaReserva: string;
  estado?: string;
  estadoPago?: string;
  codigoReserva?: string;
  total?: number;
  viaje?: {
    id: number;
    origenLocalidad: string;
    destinoLocalidad: string;
    fechaViaje: string;
    horarioSalida: string;
    precio: number;
  };
  Viaje?: Reservation["viaje"];
  pasajeros?: Pasajero[];
  Pasajeros?: Pasajero[];
}

const ULTIMA_RESERVA_ID_KEY = "ultimaReservaId";

export default function ConfirmarReservaScreen() {
  const { id, origen, destino, fecha, hora, reservaId } = useLocalSearchParams<{
    id?: string;
    origen?: string;
    destino?: string;
    fecha?: string;
    hora?: string;
    reservaId?: string;
  }>();
  const { isLoading, userInfo } = useAuth();

  const perfil = userInfo?.perfil;
  const isChofer = perfil === "usuarioChofer";
  const isCliente = perfil === "usuarioCliente";

  if (!isLoading && !isChofer && !isCliente) {
    return <Redirect href="/(tabs)" />;
  }

  if (isChofer) {
    return (
      <ChoferConfirmarReserva
        id={id}
        origen={origen}
        destino={destino}
        fecha={fecha}
        hora={hora}
        isLoading={isLoading}
      />
    );
  }

  return (
    <PassengerConfirmation
      reservaId={reservaId}
      isLoading={isLoading}
      userInfo={userInfo}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Chofer branch — preserved existing behaviour                       */
/* ------------------------------------------------------------------ */
function ChoferConfirmarReserva({
  id,
  origen,
  destino,
  fecha,
  hora,
  isLoading,
}: {
  id?: string;
  origen?: string;
  destino?: string;
  fecha?: string;
  hora?: string;
  isLoading: boolean;
}) {
  const fetchReservas = useCallback(async () => {
    const data = await listarReservasYPasajerosPorViaje(Number(id));
    const reservasConVenta = await Promise.all(
      data.map(async (reserva: ReservaConPasajeros) => ({
        ...reserva,
        tieneVenta: await existeReservaVenta(reserva.reservaId),
      }))
    );
    return reservasConVenta;
  }, [id]);

  const { data: reservas = [], loading, error, refetch } = useAsyncData<
    ReservaConPasajeros[]
  >({
    fetchFn: fetchReservas,
    dependencies: [id],
  });

  const reservasPendientes = reservas.filter((r) => !r.tieneVenta);
  const reservasConfirmadas = reservas.filter((r) => r.tieneVenta);

  const handleEliminar = (idPasajero: number, reservaId: number) => {
    const reserva = reservasPendientes.find((r) => r.reservaId === reservaId);
    const cantidadPasajeros = reserva?.pasajeros.length ?? 0;

    const mensaje =
      cantidadPasajeros === 1
        ? "Este es el último pasajero. Si lo eliminás, se eliminará la reserva completa. ¿Deseás continuar?"
        : "¿Estás seguro de que querés eliminar este pasajero?";

    const confirmar = async () => {
      try {
        await eliminarPasajero(idPasajero);
        if (cantidadPasajeros === 1) {
          router.replace("/(tabs)/choferReserva");
          return;
        }
        refetch();
      } catch {
        Alert.alert("Error", "No se pudo eliminar el pasajero");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(mensaje)) confirmar();
    } else {
      Alert.alert("Confirmar eliminación", mensaje, [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: confirmar },
      ]);
    }
  };

  const columns: DataTableColumn<Pasajero>[] = [
    { key: "nombre", label: "Nombre", width: 110 },
    { key: "apellido", label: "Apellido", width: 110 },
    { key: "dni", label: "DNI", width: 100 },
    { key: "ubicacionOrigen", label: "Ubi. Origen", width: 120 },
    { key: "ubicacionDestino", label: "Ubi. Destino", width: 120 },
  ];

  const columnsConAccion: DataTableColumn<Pasajero>[] = [
    ...columns,
    {
      key: "acciones",
      label: "Eliminar",
      width: 80,
      render: (item) => (
        <Pressable
          onPress={() => handleEliminar(item.id, Number(id))}
          accessibilityLabel="Eliminar pasajero"
          accessibilityRole="button"
        >
          <Ionicons name="trash-bin-outline" size={22} color="#E53935" />
        </Pressable>
      ),
    },
  ];

  const renderReserva = (item: ReservaConPasajeros, editable: boolean) => (
    <Card key={item.reservaId} style={choferStyles.card}>
      <Text style={choferStyles.label}>
        Fecha Reserva: {formatDate(item.fechaReserva)} | {origen} ➜ {destino} |{" "}
        {fecha} - {hora}hs
      </Text>

      <DataTable
        columns={editable ? columnsConAccion : columns}
        data={item.pasajeros}
        keyExtractor={(p) => p.id.toString()}
        emptyMessage="No hay pasajeros en esta reserva."
      />

      {editable && (
        <View style={choferStyles.buttonContainer}>
          <Button
            variant="primary"
            size="md"
            onPress={() =>
              router.push({
                pathname: "/pantallas/ventaReserva",
                params: { id: item.reservaId },
              })
            }
          >
            Confirmar
          </Button>
        </View>
      )}
    </Card>
  );

  return (
    <ScreenContainer
      loading={loading || isLoading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      contentContainerStyle={choferStyles.container}
    >
      {reservasPendientes.length > 0 && (
        <>
          <Text style={choferStyles.sectionTitle}>Reservas pendientes de confirmación</Text>
          {reservasPendientes.map((r) => renderReserva(r, true))}
        </>
      )}

      {reservasConfirmadas.length > 0 && (
        <>
          <Text style={choferStyles.sectionTitle}>Reservas confirmadas</Text>
          {reservasConfirmadas.map((r) => renderReserva(r, false))}
        </>
      )}

      {reservasPendientes.length === 0 && reservasConfirmadas.length === 0 && (
        <Text style={choferStyles.emptyMessage}>
          No hay reservas registradas para este viaje.
        </Text>
      )}
    </ScreenContainer>
  );
}

/* ------------------------------------------------------------------ */
/* Passenger branch — booking confirmation & payment                  */
/* ------------------------------------------------------------------ */
function PassengerConfirmation({
  reservaId,
  isLoading,
  userInfo,
}: {
  reservaId?: string;
  isLoading: boolean;
  userInfo: any;
}) {
  const router = useRouter();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");
  const warning = useThemeColor({}, "warning");
  const errorColor = useThemeColor({}, "error");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const background = useThemeColor({}, "background");

  useEffect(() => {
    if (isLoading) return;
    if (!reservaId) {
      setLoading(false);
      setError("No se especificó una reserva.");
      return;
    }
    if (!userInfo?.id) return;

    let cancelled = false;
    const fetchReservation = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerReservas(userInfo.id);
        const list = Array.isArray(data) ? data : data.data || [];
        const found = list.find((r: Reservation) => String(r.id) === String(reservaId));
        if (!cancelled) {
          if (found) {
            setReservation(found);
          } else {
            setError("No encontramos la reserva solicitada.");
          }
        }
      } catch {
        if (!cancelled) setError("No pudimos cargar los datos de la reserva.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReservation();
    return () => {
      cancelled = true;
    };
  }, [reservaId, isLoading, userInfo?.id]);

  const handlePayment = async () => {
    if (!reservaId) return;
    setPaying(true);
    try {
      await AsyncStorage.setItem(ULTIMA_RESERVA_ID_KEY, reservaId);
      const response = await crearPreferencia(reservaId);
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
      setPaying(false);
    }
  };

  if (isLoading || loading) {
    return (
      <View style={[passengerStyles.loader, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[passengerStyles.loaderText, { color: textSecondary }]}>
          Cargando confirmación…
        </Text>
      </View>
    );
  }

  if (error || !reservation) {
    return (
      <ScreenContainer scrollEnabled={false}>
        <EmptyState
          icon="alert-circle-outline"
          title="Reserva no encontrada"
          description={error || "No pudimos encontrar la reserva que buscás."}
          action={{
            label: "Ir a mis reservas",
            onPress: () => router.push("/(tabs)/reserva"),
          }}
        />
      </ScreenContainer>
    );
  }

  const trip = (reservation.viaje || reservation.Viaje || {}) as NonNullable<
    Reservation["viaje"]
  >;
  const passengers = reservation.pasajeros || reservation.Pasajeros || [];
  const isPaid =
    reservation.estadoPago === "Pagado" ||
    reservation.estado === "Pagado" ||
    reservation.estado === "Pagada";
  const isPending = !isPaid;
  const code = reservation.codigoReserva || reservation.id;
  const total =
    reservation.total || trip.precio * (passengers.length || 1) || 0;

  return (
    <ScreenContainer>
      <ScrollView
        style={[passengerStyles.scroll, { backgroundColor: background }]}
        contentContainerStyle={passengerStyles.container}
        showsVerticalScrollIndicator={false}
      >
        <Card style={StyleSheet.flatten([passengerStyles.statusCard, isPaid ? passengerStyles.statusCardPaid : undefined])}>
          <View style={passengerStyles.statusRow}>
            <View
              style={[
                passengerStyles.statusIconCircle,
                { backgroundColor: isPaid ? `${success}15` : `${warning}15` },
              ]}
            >
              <Ionicons
                name={isPaid ? "checkmark-circle-outline" : "alert-circle-outline"}
                size={40}
                color={isPaid ? success : warning}
              />
            </View>
            <View style={passengerStyles.statusText}>
              <Text style={[passengerStyles.statusTitle, { color: text }]} allowFontScaling>
                {isPaid ? "¡Reserva confirmada y pagada!" : "¡Reserva confirmada!"}
              </Text>
              <Text style={[passengerStyles.statusSubtitle, { color: textSecondary }]} allowFontScaling>
                {isPaid
                  ? "Tu lugar está asegurado. Guardá tu comprobante."
                  : "Tu lugar está reservado. Recordá que tenés 24 hs para abonar."}
              </Text>
            </View>
          </View>

          <View style={[passengerStyles.codeBox, { backgroundColor: surfaceElevated }]}>
            <Text style={[passengerStyles.codeLabel, { color: textSecondary }]} allowFontScaling>
              Código de reserva
            </Text>
            <Text style={[passengerStyles.codeValue, { color: text }]} allowFontScaling>
              {code}
            </Text>
          </View>
        </Card>

        <Card>
          <Text style={[passengerStyles.sectionTitle, { color: text }]} allowFontScaling>
            Detalle del viaje
          </Text>
          <View style={passengerStyles.routeRow}>
            <View style={passengerStyles.routeStop}>
              <Ionicons name="location" size={20} color={primary} />
              <View>
                <Text style={[passengerStyles.routeLabel, { color: textSecondary }]} allowFontScaling>
                  Origen
                </Text>
                <Text style={[passengerStyles.routeName, { color: text }]} allowFontScaling>
                  {trip.origenLocalidad}
                </Text>
              </View>
            </View>
            <View style={passengerStyles.routeStop}>
              <Ionicons name="location" size={20} color={warning} />
              <View>
                <Text style={[passengerStyles.routeLabel, { color: textSecondary }]} allowFontScaling>
                  Destino
                </Text>
                <Text style={[passengerStyles.routeName, { color: text }]} allowFontScaling>
                  {trip.destinoLocalidad}
                </Text>
              </View>
            </View>
          </View>

          <View style={passengerStyles.detailsRow}>
            <View style={passengerStyles.detailItem}>
              <Ionicons name="calendar-outline" size={18} color={textMuted} />
              <Text style={[passengerStyles.detailText, { color: textSecondary }]} allowFontScaling>
                {trip.fechaViaje
                  ? new Date(trip.fechaViaje).toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "2-digit",
                      month: "long",
                    })
                  : "Fecha no disponible"}
              </Text>
            </View>
            <View style={passengerStyles.detailItem}>
              <Ionicons name="time-outline" size={18} color={textMuted} />
              <Text style={[passengerStyles.detailText, { color: textSecondary }]} allowFontScaling>
                {trip.horarioSalida?.substring(0, 5) || "--:--"} hs
              </Text>
            </View>
            <View style={passengerStyles.detailItem}>
              <Ionicons name="people-outline" size={18} color={textMuted} />
              <Text style={[passengerStyles.detailText, { color: textSecondary }]} allowFontScaling>
                {passengers.length} pasajero{passengers.length !== 1 ? "s" : ""}
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <Text style={[passengerStyles.sectionTitle, { color: text }]} allowFontScaling>
            Pasajeros
          </Text>
          {passengers.map((p, idx) => (
            <View
              key={p.id || idx}
              style={[
                passengerStyles.passengerItem,
                idx < passengers.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: surfaceElevated,
                  paddingBottom: 12,
                  marginBottom: 12,
                },
              ]}
            >
              <View>
                <Text style={[passengerStyles.passengerName, { color: text }]} allowFontScaling>
                  {p.nombre} {p.apellido}
                </Text>
                <Text style={[passengerStyles.passengerMeta, { color: textSecondary }]} allowFontScaling>
                  DNI {p.dni}
                </Text>
              </View>
              <Text style={[passengerStyles.passengerStops, { color: textMuted }]} allowFontScaling>
                {p.ubicacionOrigen || trip.origenLocalidad} →{" "}
                {p.ubicacionDestino || trip.destinoLocalidad}
              </Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={[passengerStyles.sectionTitle, { color: text }]} allowFontScaling>
            Resumen de pago
          </Text>
          <View style={passengerStyles.summaryRow}>
            <Text style={[passengerStyles.summaryLabel, { color: textSecondary }]} allowFontScaling>
              Pasajes ({passengers.length})
            </Text>
            <Text style={[passengerStyles.summaryValue, { color: text }]} allowFontScaling>
              ARS ${total.toLocaleString("es-AR")}
            </Text>
          </View>
          <View style={[passengerStyles.divider, { backgroundColor: surfaceElevated }]} />
          <View style={passengerStyles.summaryRow}>
            <Text style={[passengerStyles.summaryTotalLabel, { color: text }]} allowFontScaling>
              Total
            </Text>
            <Text style={[passengerStyles.summaryTotalValue, { color: text }]} allowFontScaling>
              ARS ${total.toLocaleString("es-AR")}
            </Text>
          </View>

          <View style={passengerStyles.paymentStatus}>
            <Badge variant={isPaid ? "success" : "warning"}>
              {isPaid ? "Pagado" : "Pendiente de pago"}
            </Badge>
          </View>

          {isPending ? (
            <View style={passengerStyles.paymentActions}>
              <Button
                variant="primary"
                size="lg"
                loading={paying}
                disabled={paying}
                onPress={handlePayment}
                icon="card-outline"
                iconPosition="left"
              >
                Pagar ahora
              </Button>

              <View style={[passengerStyles.offlineBox, { backgroundColor: surfaceElevated }]}>
                <Ionicons name="storefront-outline" size={22} color={textMuted} />
                <View style={passengerStyles.offlineTextBox}>
                  <Text style={[passengerStyles.offlineTitle, { color: text }]} allowFontScaling>
                    Pagar en boletería
                  </Text>
                  <Text style={[passengerStyles.offlineText, { color: textSecondary }]} allowFontScaling>
                    Presentá el código <Text style={{ fontWeight: "800" }}>{code}</Text> en
                    cualquier boletería adherida dentro de las 24 hs.
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <Button
              variant="primary"
              size="lg"
              onPress={() => router.push("/(tabs)/reserva")}
              icon="ticket-outline"
              iconPosition="left"
            >
              Ver mis reservas
            </Button>
          )}
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const choferStyles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  card: {
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#4c68d7",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  emptyMessage: {
    textAlign: "center",
    color: "#777",
    marginTop: 40,
    fontSize: 16,
  },
});

const passengerStyles = StyleSheet.create({
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
    borderLeftWidth: 6,
    borderLeftColor: "#F97316",
  },
  statusCardPaid: {
    borderLeftColor: "#10B981",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  statusIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 4,
  },
  statusSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  codeBox: {
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
  },
  codeLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  routeRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  routeStop: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  routeName: {
    fontSize: 15,
    fontWeight: "800",
  },
  detailsRow: {
    gap: 10,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "600",
  },
  passengerItem: {},
  passengerName: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },
  passengerMeta: {
    fontSize: 13,
    fontWeight: "600",
  },
  passengerStops: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: "800",
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: "900",
  },
  paymentStatus: {
    marginTop: 14,
    marginBottom: 8,
  },
  paymentActions: {
    gap: 12,
  },
  offlineBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    padding: 14,
  },
  offlineTextBox: {
    flex: 1,
  },
  offlineTitle: {
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 4,
  },
  offlineText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
});
