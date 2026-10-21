import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Redirect } from "expo-router";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { obtenerViajesId } from "../../services/viajeServices";
import { crearReserva } from "../../services/reservaService";
import { obtenerUsuarioPorId } from "../../services/usuarioService";
import { useThemeColor } from "@/components/Themed";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";

interface Trip {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  fechaViaje: string;
  horarioSalida: string;
  precio: number;
  MedioTransporte?: {
    Empresa?: { nombre: string };
  };
}

interface Passenger {
  seatNumber: number;
  nombre: string;
  apellido: string;
  dni: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
}

export default function RealizarReservaScreen() {
  const { id, asientos } = useLocalSearchParams<{ id: string; asientos?: string }>();
  const router = useRouter();
  const { isLoading: authLoading, userInfo, isLoggedIn } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [tripLoading, setTripLoading] = useState(true);
  const [tripError, setTripError] = useState<string | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");
  const errorColor = useThemeColor({}, "error");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const background = useThemeColor({}, "background");

  const selectedSeats = React.useMemo(() => {
    if (!asientos) return [];
    return asientos
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0)
      .sort((a, b) => a - b);
  }, [asientos]);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !userInfo) return;

    let cancelled = false;
    const fetchTrip = async () => {
      setTripLoading(true);
      setTripError(null);
      try {
        const data = await obtenerViajesId(Number(id));
        if (!cancelled) {
          setTrip(data);
          setPassengers(
            selectedSeats.map((seatNumber) => ({
              seatNumber,
              nombre: "",
              apellido: "",
              dni: "",
              ubicacionOrigen: data?.origenLocalidad || "",
              ubicacionDestino: data?.destinoLocalidad || "",
            }))
          );
        }
      } catch {
        if (!cancelled) setTripError("No pudimos cargar el viaje seleccionado.");
      } finally {
        if (!cancelled) setTripLoading(false);
      }
    };

    fetchTrip();
    return () => {
      cancelled = true;
    };
  }, [id, authLoading, isLoggedIn, userInfo, selectedSeats]);

  const handlePassengerChange = (seatNumber: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.seatNumber === seatNumber ? { ...p, [field]: value } : p))
    );
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[`${seatNumber}-${field}`];
      return next;
    });
  };

  const handleAutofill = async () => {
    try {
      if (!userInfo?.id) return;
      const response = await obtenerUsuarioPorId(userInfo.id);
      const usuario = Array.isArray(response) ? response[0] : response;
      if (!usuario) return;

      setPassengers((prev) => {
        if (prev.length === 0) return prev;
        const [first, ...rest] = prev;
        return [
          {
            ...first,
            nombre: usuario.nombre ? String(usuario.nombre) : first.nombre,
            apellido: usuario.apellido ? String(usuario.apellido) : first.apellido,
            dni: usuario.dni ? String(usuario.dni) : first.dni,
          },
          ...rest,
        ];
      });

      if (Platform.OS === "web") {
        window.alert("Tus datos fueron cargados");
      } else {
        Alert.alert("Listo", "Tus datos fueron cargados");
      }
    } catch {
      if (Platform.OS === "web") {
        window.alert("No se pudieron cargar tus datos.");
      } else {
        Alert.alert("Error", "No se pudieron cargar tus datos.");
      }
    }
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    passengers.forEach((p) => {
      if (!p.nombre.trim()) errors[`${p.seatNumber}-nombre`] = "Ingresá el nombre";
      if (!p.apellido.trim()) errors[`${p.seatNumber}-apellido`] = "Ingresá el apellido";
      if (!p.dni.trim()) errors[`${p.seatNumber}-dni`] = "Ingresá el DNI";
      else if (p.dni.trim().length < 7) errors[`${p.seatNumber}-dni`] = "DNI inválido";
      if (!p.ubicacionOrigen.trim())
        errors[`${p.seatNumber}-ubicacionOrigen`] = "Ingresá el punto de subida";
      if (!p.ubicacionDestino.trim())
        errors[`${p.seatNumber}-ubicacionDestino`] = "Ingresá el punto de bajada";
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!trip || passengers.length === 0) return;
    if (!validate()) {
      if (Platform.OS === "web") {
        window.alert("Revisá los datos de los pasajeros");
      } else {
        Alert.alert("Datos incompletos", "Revisá los datos de los pasajeros");
      }
      return;
    }

    setSubmitting(true);
    try {
      const personasData = passengers.map((p) => ({
        nombre: p.nombre.trim(),
        apellido: p.apellido.trim(),
        dni: parseInt(p.dni.trim(), 10),
        ubicacionOrigen: p.ubicacionOrigen.trim() || trip.origenLocalidad,
        ubicacionDestino: p.ubicacionDestino.trim() || trip.destinoLocalidad,
        numeroAsiento: Number(p.seatNumber),
      }));

      const reservaData = {
        usuarios_id: Number(userInfo?.id),
        viajes_id: Number(trip.id),
        fechaReserva: new Date().toISOString(),
        personas: personasData,
        asientos_reservados: selectedSeats.length,
      };

      const response = await crearReserva(reservaData);
      const created = response?.data || response;
      const reservaId = created?.id || created?.reservaId;

      if (Platform.OS === "web") {
        window.alert("Reserva exitosa");
      }

      router.push({
        pathname: "/pantallas/confirmarReserva",
        params: { reservaId: String(reservaId || "nueva") },
      });
    } catch (error: any) {
      const respuesta = error?.response?.data;
      const errores = respuesta?.errores;

      if (Array.isArray(errores)) {
        const erroresMap: Record<string, string> = {};
        errores.forEach((err: any) => {
          if (err.path) {
            erroresMap[err.path] = err.msg;
          } else if (err.msg?.includes("duplicado")) {
            passengers.forEach((p) => {
              erroresMap[`${p.seatNumber}-dni`] = err.msg;
            });
          }
        });
        setFieldErrors(erroresMap);
      }

      const mensaje =
        respuesta?.mensaje || respuesta?.message || "Hubo un error al crear la reserva.";
      if (Platform.OS === "web") {
        window.alert("Atención: " + mensaje);
      } else {
        Alert.alert("Atención", mensaje);
      }
    } finally {
      setSubmitting(false);
    }
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

  if (tripLoading) {
    return (
      <View style={[styles.loader, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
        <Text style={[styles.loaderText, { color: textSecondary }]}>
          Cargando viaje…
        </Text>
      </View>
    );
  }

  if (tripError || !trip) {
    return (
      <ScreenContainer scrollEnabled={false}>
        <EmptyState
          icon="alert-circle-outline"
          title="Viaje no disponible"
          description={tripError || "El viaje que querés reservar no está disponible."}
          action={{
            label: "Buscar otro viaje",
            onPress: () => router.push("/(tabs)/viajes"),
          }}
        />
      </ScreenContainer>
    );
  }

  if (selectedSeats.length === 0) {
    return (
      <ScreenContainer scrollEnabled={false}>
        <EmptyState
          icon="airplane"
          title="No seleccionaste asientos"
          description="Volvé al viaje y elegí al menos un asiento para continuar."
          action={{
            label: "Elegir asientos",
            onPress: () => router.push({ pathname: "/pantallas/seleccionarAsientos" as any, params: { id } }),
          }}
        />
      </ScreenContainer>
    );
  }

  const total = trip.precio * passengers.length;

  return (
    <ScreenContainer>
      <KeyboardAwareScrollView
        style={[styles.scroll, { backgroundColor: background }]}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={120}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.tripCard}>
          <Text style={[styles.tripRoute, { color: text }]} allowFontScaling>
            {trip.origenLocalidad} → {trip.destinoLocalidad}
          </Text>
          <Text style={[styles.tripMeta, { color: textSecondary }]} allowFontScaling>
            {new Date(trip.fechaViaje).toLocaleDateString("es-AR", {
              weekday: "long",
              day: "2-digit",
              month: "long",
            })}{" "}
            · {trip.horarioSalida?.substring(0, 5) || "--:--"} hs ·{" "}
            {trip.MedioTransporte?.Empresa?.nombre || "V&V Express"}
          </Text>
        </Card>

        <View style={styles.formsHeader}>
          <Text style={[styles.sectionTitle, { color: text }]} allowFontScaling>
            Datos de los pasajeros
          </Text>
          <Button
            variant="secondary"
            size="sm"
            onPress={handleAutofill}
            icon="person-outline"
            iconPosition="left"
          >
            Cargar mis datos
          </Button>
        </View>

        {passengers.map((passenger, index) => (
          <Card key={passenger.seatNumber} style={styles.passengerCard}>
            <View style={styles.passengerHeader}>
              <Badge variant="primary">
                <Ionicons name="airplane" size={12} color={primary} /> Asiento{" "}
                {passenger.seatNumber}
              </Badge>
              <Text style={[styles.passengerIndex, { color: textMuted }]} allowFontScaling>
                Pasajero {index + 1}
              </Text>
            </View>

            <InputField
              label="Nombre"
              placeholder="Ej: Juan"
              value={passenger.nombre}
              onChangeText={(value) => handlePassengerChange(passenger.seatNumber, "nombre", value)}
              icon="person-outline"
              error={fieldErrors[`${passenger.seatNumber}-nombre`]}
              autoComplete="given-name"
              required
            />
            <InputField
              label="Apellido"
              placeholder="Ej: Pérez"
              value={passenger.apellido}
              onChangeText={(value) =>
                handlePassengerChange(passenger.seatNumber, "apellido", value)
              }
              icon="person-outline"
              error={fieldErrors[`${passenger.seatNumber}-apellido`]}
              autoComplete="family-name"
              required
            />
            <InputField
              label="DNI"
              placeholder="Número de documento"
              value={passenger.dni}
              onChangeText={(value) =>
                handlePassengerChange(
                  passenger.seatNumber,
                  "dni",
                  value.replace(/\D/g, "")
                )
              }
              icon="card-outline"
              keyboardType="numeric"
              error={fieldErrors[`${passenger.seatNumber}-dni`]}
              required
            />
            <InputField
              label="Punto de subida"
              placeholder="¿Dónde te buscamos?"
              value={passenger.ubicacionOrigen}
              onChangeText={(value) =>
                handlePassengerChange(passenger.seatNumber, "ubicacionOrigen", value)
              }
              icon="navigate-outline"
              error={fieldErrors[`${passenger.seatNumber}-ubicacionOrigen`]}
              helper="Ingresá calles con número o intersecciones. Ej: Salta 1200"
              required
            />
            <InputField
              label="Punto de bajada"
              placeholder="¿Dónde te dejamos?"
              value={passenger.ubicacionDestino}
              onChangeText={(value) =>
                handlePassengerChange(passenger.seatNumber, "ubicacionDestino", value)
              }
              icon="flag-outline"
              error={fieldErrors[`${passenger.seatNumber}-ubicacionDestino`]}
              helper="Ingresá calles con número o intersecciones. Ej: Laprida y Jujuy"
              required
            />
          </Card>
        ))}

        <Card style={styles.totalCard}>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: textSecondary }]} allowFontScaling>
              Total ({passengers.length} pasaje{passengers.length !== 1 ? "s" : ""})
            </Text>
            <Text style={[styles.totalValue, { color: text }]} allowFontScaling>
              ARS ${total.toLocaleString("es-AR")}
            </Text>
          </View>
          <Button
            variant="primary"
            size="lg"
            loading={submitting}
            disabled={submitting}
            onPress={handleSubmit}
            icon="checkmark"
            iconPosition="left"
            accessibilityLabel="Confirmar reserva"
          >
            Confirmar reserva
          </Button>
        </Card>
      </KeyboardAwareScrollView>
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
  },
  tripCard: {
    marginBottom: 16,
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
  formsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
  },
  passengerCard: {
    marginBottom: 16,
  },
  passengerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  passengerIndex: {
    fontSize: 13,
    fontWeight: "600",
  },
  totalCard: {
    marginTop: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "700",
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "900",
  },
});
