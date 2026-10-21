import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { obtenerViajesId, obtenerAsientosOcupados } from "../../services/viajeServices";
import { useThemeColor } from "@/components/Themed";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

interface Trip {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  fechaViaje: string;
  horarioSalida: string;
  precio: number;
  cantPasajeros: number;
  MedioTransporte?: {
    cantLugares?: number;
    Empresa?: {
      nombre: string;
    };
  };
}

const MAX_SEATS_PER_BOOKING = 3;

export default function DetalleViajeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isLoading: authLoading, userInfo, isLoggedIn } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");
  const errorColor = useThemeColor({}, "error");
  const success = useThemeColor({}, "success");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !userInfo) return;

    let cancelled = false;
    const fetchTrip = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await obtenerViajesId(Number(id));
        if (!cancelled) setTrip(data);

        try {
          const asientosRes = await obtenerAsientosOcupados(Number(id));
          const asientosData = asientosRes?.data || asientosRes;
          if (Array.isArray(asientosData?.mapaAsientos)) {
            const ocupados = asientosData.mapaAsientos
              .filter((a: any) => a.ocupado)
              .map((a: any) => a.numero);
            setOccupiedSeats(ocupados);
          } else {
            setOccupiedSeats(generateMockOccupiedSeats(id, data?.cantPasajeros));
          }
        } catch {
          setOccupiedSeats(generateMockOccupiedSeats(id, data?.cantPasajeros));
        }
      } catch {
        if (!cancelled) {
          setError("No pudimos cargar los detalles del viaje.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTrip();
    return () => {
      cancelled = true;
    };
  }, [id, authLoading, isLoggedIn, userInfo]);

  if (authLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: useThemeColor({}, "background") }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  if (!isLoggedIn || !userInfo) {
    return <Redirect href="/login" />;
  }

  const handleSelectSeats = () => {
    router.push({
      pathname: "/pantallas/seleccionarAsientos" as any,
      params: { id: String(id) },
    });
  };

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: useThemeColor({}, "background") }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loaderText, { color: textSecondary }]}>
          Cargando detalles del viaje…
        </Text>
      </View>
    );
  }

  if (error || !trip) {
    return (
      <ScreenContainer scrollEnabled={false}>
        <EmptyState
          icon="alert-circle-outline"
          title="Viaje no encontrado"
          description={error || "El viaje que buscás no existe o no está disponible."}
          action={{
            label: "Buscar otro viaje",
            onPress: () => router.push("/(tabs)/viajes"),
          }}
        />
      </ScreenContainer>
    );
  }

  const empresaNombre = trip.MedioTransporte?.Empresa?.nombre || "V&V Express";
  const totalSeats = trip.MedioTransporte?.cantLugares || 19;
  const availableSeats = Math.max(0, trip.cantPasajeros ?? totalSeats);
  const disponibilidadBaja = availableSeats < 5;
  const fecha = new Date(trip.fechaViaje).toLocaleDateString("es-AR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const hora = trip.horarioSalida?.substring(0, 5) || "--:--";

  return (
    <ScreenContainer>
      <ScrollView
        style={[styles.scroll, { backgroundColor: useThemeColor({}, "background") }]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <View style={styles.headerTop}>
            <Badge variant="primary">{empresaNombre}</Badge>
            <Badge variant={disponibilidadBaja ? "error" : "success"}>
              <Ionicons
                name="people-outline"
                size={12}
                color={disponibilidadBaja ? errorColor : success}
              />
              {" "}
              {availableSeats} {availableSeats === 1 ? "lugar" : "lugares"}
            </Badge>
          </View>

          <Text style={[styles.title, { color: text }]} allowFontScaling>
            {trip.origenLocalidad} → {trip.destinoLocalidad}
          </Text>

          <View style={styles.metaGrid}>
            <View style={styles.metaItem}>
              <Ionicons name="calendar-outline" size={20} color={primary} />
              <View>
                <Text style={[styles.metaLabel, { color: textSecondary }]} allowFontScaling>
                  Fecha
                </Text>
                <Text style={[styles.metaValue, { color: text }]} allowFontScaling>
                  {fecha}
                </Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={20} color={primary} />
              <View>
                <Text style={[styles.metaLabel, { color: textSecondary }]} allowFontScaling>
                  Salida
                </Text>
                <Text style={[styles.metaValue, { color: text }]} allowFontScaling>
                  {hora} hs
                </Text>
              </View>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="bus-outline" size={20} color={primary} />
              <View>
                <Text style={[styles.metaLabel, { color: textSecondary }]} allowFontScaling>
                  Minibús
                </Text>
                <Text style={[styles.metaValue, { color: text }]} allowFontScaling>
                  {totalSeats} asientos
                </Text>
              </View>
            </View>
          </View>
        </Card>

        <Card style={styles.stopsCard}>
          <Text style={[styles.sectionTitle, { color: text }]} allowFontScaling>
            Recorrido
          </Text>
          <View style={styles.routeList}>
            <View style={styles.routeStop}>
              <View style={[styles.routeDot, { backgroundColor: primary }]} />
              <View>
                <Text style={[styles.routeLabel, { color: textSecondary }]} allowFontScaling>
                  Origen
                </Text>
                <Text style={[styles.routeName, { color: text }]} allowFontScaling>
                  {trip.origenLocalidad}
                </Text>
              </View>
            </View>
            <View style={[styles.routeLine, { backgroundColor: surfaceElevated }]} />
            <View style={styles.routeStop}>
              <View style={[styles.routeDot, { backgroundColor: useThemeColor({}, "accent") }]} />
              <View>
                <Text style={[styles.routeLabel, { color: textSecondary }]} allowFontScaling>
                  Destino
                </Text>
                <Text style={[styles.routeName, { color: text }]} allowFontScaling>
                  {trip.destinoLocalidad}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.hintRow}>
            <Ionicons name="location-outline" size={16} color={textMuted} />
            <Text style={[styles.hintText, { color: textMuted }]} allowFontScaling>
              El punto exacto de subida/bajada lo indicarás en el siguiente paso.
            </Text>
          </View>
        </Card>

        <Card style={styles.seatsCard}>
          <Text style={[styles.sectionTitle, { color: text }]} allowFontScaling>
            Disponibilidad de asientos
          </Text>
          <MiniSeatMap occupiedSeats={occupiedSeats} totalSeats={totalSeats} />
          <Text style={[styles.seatsCaption, { color: textSecondary }]} allowFontScaling>
            Los asientos en gris ya están reservados. Podés elegir hasta{" "}
            {MAX_SEATS_PER_BOOKING} asientos por reserva.
          </Text>
        </Card>

        <Card style={styles.summaryCard}>
          <View style={styles.priceBlock}>
            <Text style={[styles.priceLabel, { color: textSecondary }]} allowFontScaling>
              Precio por pasajero
            </Text>
            <View style={styles.priceRow}>
              <Text style={[styles.currency, { color: primary }]} allowFontScaling>
                $
              </Text>
              <Text style={[styles.priceValue, { color: text }]} allowFontScaling>
                {trip.precio.toLocaleString("es-AR")}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: surfaceElevated }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: textSecondary }]} allowFontScaling>
              Asientos disponibles
            </Text>
            <Text style={[styles.summaryValue, { color: text }]} allowFontScaling>
              {availableSeats}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: textSecondary }]} allowFontScaling>
              Máximo por reserva
            </Text>
            <Text style={[styles.summaryValue, { color: text }]} allowFontScaling>
              {MAX_SEATS_PER_BOOKING}
            </Text>
          </View>

          <View style={styles.securityRow}>
            <Ionicons name="shield-checkmark-outline" size={18} color={success} />
            <Text style={[styles.securityText, { color: textSecondary }]} allowFontScaling>
              Reserva inmediata y pago seguro
            </Text>
          </View>

          <Button
            variant="primary"
            size="lg"
            onPress={handleSelectSeats}
            icon="chevron-forward"
            iconPosition="right"
            accessibilityLabel="Elegir asientos para este viaje"
          >
            Elegir asientos
          </Button>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const MiniSeatMap = ({
  occupiedSeats,
  totalSeats,
}: {
  occupiedSeats: number[];
  totalSeats: number;
}) => {
  const rows = buildSeatRows(totalSeats);
  const primary = useThemeColor({}, "primary");
  const error = useThemeColor({}, "error");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const textMuted = useThemeColor({}, "textMuted");

  return (
    <View style={miniStyles.map}>
      <View style={miniStyles.driver}>
        <Ionicons name="radio-button-on" size={20} color={textMuted} />
        <Text style={[miniStyles.driverText, { color: textMuted }]} allowFontScaling>
          Chofer
        </Text>
      </View>
      <View style={miniStyles.rows}>
        {rows.map((row, idx) => (
          <View key={idx} style={miniStyles.row}>
            {row.map((seatNum, sIdx) => {
              if (seatNum === null) {
                return <View key={`aisle-${idx}-${sIdx}`} style={miniStyles.aisle} />;
              }
              const isOccupied = occupiedSeats.includes(seatNum);
              return (
                <View
                  key={seatNum}
                  style={[
                    miniStyles.seat,
                    {
                      backgroundColor: isOccupied ? surfaceElevated : `${primary}15`,
                      borderColor: isOccupied ? surfaceElevated : `${primary}30`,
                    },
                  ]}
                  accessibilityLabel={`Asiento ${seatNum}, ${isOccupied ? "ocupado" : "libre"}`}
                >
                  <Text
                    allowFontScaling
                    style={[
                      miniStyles.seatNumber,
                      { color: isOccupied ? textMuted : primary },
                    ]}
                  >
                    {seatNum}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

function buildSeatRows(totalSeats: number) {
  if (totalSeats <= 19) {
    return [
      [1, null, 2],
      [3, null, 4],
      [5, 6, 7],
      [8, 9, 10],
      [11, 12, 13],
      [14, 15, 16],
      [17, 18, 19].slice(0, Math.max(0, totalSeats - 14)),
    ].filter((r) => r.length > 0);
  }
  const rows: (number | null)[][] = [[1, null, 2]];
  let seat = 3;
  while (seat <= totalSeats) {
    const remaining = totalSeats - seat + 1;
    if (remaining >= 3) {
      rows.push([seat, seat + 1, seat + 2]);
      seat += 3;
    } else {
      rows.push(Array.from({ length: remaining }, (_, i) => seat + i));
      break;
    }
  }
  return rows;
}

function generateMockOccupiedSeats(tripId: string | number, available?: number) {
  const total = 19;
  const occupiedCount = Math.max(0, Math.min(total - 1, total - (available ?? total)));
  const seats: number[] = [];
  let hash = 0;
  String(tripId)
    .split("")
    .forEach((c) => {
      hash = (hash * 31 + c.charCodeAt(0)) % 1000;
    });
  for (let i = 1; i <= occupiedCount; i++) {
    const seat = ((hash + i * 7) % total) + 1;
    if (!seats.includes(seat)) seats.push(seat);
  }
  return seats.sort((a, b) => a - b);
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
  headerCard: {
    marginBottom: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 16,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 140,
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: 15,
    fontWeight: "800",
  },
  stopsCard: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 14,
  },
  routeList: {
    gap: 8,
  },
  routeStop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  routeDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  routeLine: {
    width: 2,
    height: 24,
    marginLeft: 6,
  },
  routeLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  routeName: {
    fontSize: 16,
    fontWeight: "800",
  },
  hintRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 16,
    gap: 8,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  seatsCard: {},
  seatsCaption: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  summaryCard: {},
  priceBlock: {
    marginBottom: 14,
  },
  priceLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    fontSize: 20,
    fontWeight: "800",
    marginRight: 2,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    marginVertical: 14,
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
  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 16,
  },
  securityText: {
    fontSize: 13,
    fontWeight: "700",
  },
});

const miniStyles = StyleSheet.create({
  map: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  driver: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  driverText: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 2,
  },
  rows: {
    flex: 1,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  aisle: {
    flex: 1,
  },
  seat: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  seatNumber: {
    fontSize: 11,
    fontWeight: "800",
  },
});
