import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  AccessibilityInfo,
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
    Empresa?: { nombre: string };
  };
}

const MAX_SEATS = 3;

export default function SeleccionarAsientosScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isLoading: authLoading, userInfo, isLoggedIn } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [occupiedSeats, setOccupiedSeats] = useState<number[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [seatError, setSeatError] = useState<string | null>(null);

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");
  const errorColor = useThemeColor({}, "error");
  const warning = useThemeColor({}, "warning");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const background = useThemeColor({}, "background");

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
        if (!cancelled) setError("No pudimos cargar el viaje seleccionado.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTrip();
    return () => {
      cancelled = true;
    };
  }, [id, authLoading, isLoggedIn, userInfo]);

  useEffect(() => {
    if (selectedSeats.length > 0) {
      AccessibilityInfo.announceForAccessibility(
        `Seleccionados ${selectedSeats.length} asientos: ${selectedSeats.join(", ")}. Podés elegir ${
          MAX_SEATS - selectedSeats.length
        } más.`
      );
    }
  }, [selectedSeats]);

  const handleToggleSeat = useCallback(
    (seatNumber: number) => {
      setSeatError(null);
      if (selectedSeats.includes(seatNumber)) {
        setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
      } else {
        if (selectedSeats.length >= MAX_SEATS) {
          setSeatError(`Solo podés reservar hasta ${MAX_SEATS} asientos`);
          return;
        }
        setSelectedSeats((prev) => [...prev, seatNumber].sort((a, b) => a - b));
      }
    },
    [selectedSeats]
  );

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      setSeatError("Seleccioná al menos un asiento");
      return;
    }
    router.push({
      pathname: "/pantallas/realizarReserva",
      params: {
        id: String(id),
        asientos: selectedSeats.join(","),
      },
    });
  };

  if (authLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  if (!isLoggedIn || !userInfo) {
    return <Redirect href="/login" />;
  }

  if (loading) {
    return (
      <View style={[styles.loader, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loaderText, { color: textSecondary }]}>
          Cargando asientos…
        </Text>
      </View>
    );
  }

  if (error || !trip) {
    return (
      <ScreenContainer scrollEnabled={false}>
        <EmptyState
          icon="alert-circle-outline"
          title="Viaje no disponible"
          description={error || "El viaje que querés reservar no está disponible."}
          action={{
            label: "Buscar otro viaje",
            onPress: () => router.push("/(tabs)/viajes"),
          }}
        />
      </ScreenContainer>
    );
  }

  const totalSeats = trip.MedioTransporte?.cantLugares || 19;
  const rows = buildSeatRows(totalSeats);
  const remaining = MAX_SEATS - selectedSeats.length;

  return (
    <ScreenContainer>
      <ScrollView
        style={[styles.scroll, { backgroundColor: background }]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.tripSummary}>
          <Text style={[styles.tripRoute, { color: text }]} allowFontScaling>
            {trip.origenLocalidad} → {trip.destinoLocalidad}
          </Text>
          <Text style={[styles.tripMeta, { color: textSecondary }]} allowFontScaling>
            {new Date(trip.fechaViaje).toLocaleDateString("es-AR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}{" "}
            · {trip.horarioSalida?.substring(0, 5) || "--:--"} hs
          </Text>
        </Card>

        <Card style={styles.selectorCard}>
          <View style={styles.selectorHeader}>
            <View>
              <Text style={[styles.selectorTitle, { color: text }]} allowFontScaling>
                Seleccioná tus asientos
              </Text>
              <Text style={[styles.selectorSubtitle, { color: textSecondary }]} allowFontScaling>
                Máximo {MAX_SEATS} asientos por reserva
              </Text>
            </View>
            <Badge variant={selectedSeats.length === MAX_SEATS ? "accent" : "primary"}>
              {selectedSeats.length}/{MAX_SEATS}
            </Badge>
          </View>

          <View
            style={styles.busContainer}
            accessibilityLabel="Mapa de asientos del minibús"
            accessibilityRole="adjustable"
          >
            <View style={styles.driverArea}>
              <Ionicons name="radio-button-on" size={28} color={textMuted} />
              <Text style={[styles.driverLabel, { color: textMuted }]} allowFontScaling>
                Chofer
              </Text>
            </View>

            <View style={styles.rowsContainer}>
              {rows.map((row, rowIndex) => (
                <View key={rowIndex} style={styles.row}>
                  {row.map((seatNum, seatIdx) => {
                    if (seatNum === null) {
                      return <View key={`aisle-${rowIndex}-${seatIdx}`} style={styles.aisle} />;
                    }
                    const isSelected = selectedSeats.includes(seatNum);
                    const isOccupied = occupiedSeats.includes(seatNum);
                    const label = `Asiento ${seatNum}${
                      isOccupied ? ", ocupado" : isSelected ? ", seleccionado" : ", libre"
                    }`;

                    return (
                      <Pressable
                        key={seatNum}
                        onPress={() => handleToggleSeat(seatNum)}
                        disabled={isOccupied}
                        accessibilityLabel={label}
                        accessibilityRole="button"
                        accessibilityState={{
                          selected: isSelected,
                          disabled: isOccupied,
                        }}
                        style={({ pressed }) => [
                          styles.seat,
                          {
                            backgroundColor: isOccupied
                              ? surfaceElevated
                              : isSelected
                              ? primary
                              : `${primary}12`,
                            borderColor: isOccupied
                              ? surfaceElevated
                              : isSelected
                              ? primary
                              : `${primary}25`,
                            opacity: isOccupied ? 0.6 : pressed ? 0.85 : 1,
                          },
                        ]}
                      >
                        <Ionicons
                          name="airplane"
                          size={20}
                          color={
                            isOccupied ? textMuted : isSelected ? "#FFFFFF" : primary
                          }
                        />
                        <Text
                          allowFontScaling
                          style={[
                            styles.seatNumber,
                            {
                              color: isOccupied
                                ? textMuted
                                : isSelected
                                ? "#FFFFFF"
                                : primary,
                            },
                          ]}
                        >
                          {seatNum}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          </View>

          <View style={styles.legend} accessibilityLabel="Leyenda de asientos">
            <LegendItem color={`${primary}25`} fill={`${primary}12`} label="Libre" />
            <LegendItem color={primary} fill={primary} label="Seleccionado" textColor="#FFFFFF" />
            <LegendItem color={surfaceElevated} fill={surfaceElevated} label="Ocupado" />
          </View>

          {seatError && (
            <View style={styles.errorRow}>
              <Ionicons name="alert-circle-outline" size={16} color={errorColor} />
              <Text style={[styles.errorText, { color: errorColor }]} allowFontScaling>
                {seatError}
              </Text>
            </View>
          )}

          <View
            style={styles.liveRegion}
            accessibilityLiveRegion="polite"
            accessibilityLabel={
              selectedSeats.length > 0
                ? `Seleccionados ${selectedSeats.length} asientos: ${selectedSeats.join(", ")}. Podés elegir ${remaining} más.`
                : "No seleccionaste ningún asiento."
            }
          >
            <Text style={{ color: textSecondary }} allowFontScaling>
              {selectedSeats.length > 0
                ? `Asientos ${selectedSeats.join(", ")} · podés elegir ${remaining} más`
                : "Tocá un asiento disponible para seleccionarlo"}
            </Text>
          </View>
        </Card>

        <Card style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: textSecondary }]} allowFontScaling>
              Total estimado
            </Text>
            <Text style={[styles.priceValue, { color: text }]} allowFontScaling>
              ARS ${(trip.precio * selectedSeats.length).toLocaleString("es-AR")}
            </Text>
          </View>
          <Button
            variant="primary"
            size="lg"
            disabled={selectedSeats.length === 0}
            onPress={handleContinue}
            icon="arrow-forward"
            iconPosition="right"
            accessibilityLabel="Continuar con los datos de los pasajeros"
          >
            Continuar con los datos
          </Button>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

const LegendItem = ({
  color,
  fill,
  label,
  textColor,
}: {
  color: string;
  fill: string;
  label: string;
  textColor?: string;
}) => {
  const text = useThemeColor({}, "text");
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendBox,
          { backgroundColor: fill, borderColor: color },
        ]}
      >
        <Ionicons name="airplane" size={12} color={textColor || text} />
      </View>
      <Text style={[styles.legendText, { color: text }]} allowFontScaling>
        {label}
      </Text>
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
  tripSummary: {
    alignItems: "center",
  },
  tripRoute: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
  },
  tripMeta: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  selectorCard: {},
  selectorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 2,
  },
  selectorSubtitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  busContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 16,
  },
  driverArea: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  driverLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
  rowsContainer: {
    flex: 1,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  aisle: {
    flex: 1,
  },
  seat: {
    width: 52,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  seatNumber: {
    fontSize: 12,
    fontWeight: "800",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  legendText: {
    fontSize: 12,
    fontWeight: "700",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "700",
  },
  liveRegion: {
    alignItems: "center",
    paddingVertical: 8,
  },
  priceCard: {},
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  priceValue: {
    fontSize: 20,
    fontWeight: "900",
  },
});
