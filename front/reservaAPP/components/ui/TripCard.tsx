import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../Themed";
import Card from "./Card";
import Badge from "./Badge";
import Button from "./Button";

export interface Trip {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  horarioSalida: string;
  fechaViaje: string;
  precio: number;
  cantPasajeros: number;
  usuarioEmpresa_id?: number;
  medioTransporte_id?: number;
  eliminado?: string;
  MedioTransporte?: {
    Empresa?: {
      nombre: string;
    };
  };
}

interface TripCardProps {
  trip: Trip;
  onSelect: (trip: Trip) => void;
}

export default function TripCard({ trip, onSelect }: TripCardProps) {
  const {
    origenLocalidad,
    destinoLocalidad,
    horarioSalida,
    fechaViaje,
    precio,
    cantPasajeros,
    MedioTransporte,
  } = trip;

  const empresaNombre = MedioTransporte?.Empresa?.nombre || "V&V Express";
  const disponibilidadBaja = cantPasajeros < 5;

  const primary = useThemeColor({}, "primary");
  const accent = useThemeColor({}, "accent");
  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");

  const fecha = new Date(fechaViaje);
  const fechaLabel = isNaN(fecha.getTime())
    ? fechaViaje
    : fecha.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Badge variant="primary">{empresaNombre}</Badge>
        <View style={styles.price}>
          <Text
            allowFontScaling
            style={[styles.currency, { color: primary }]}
          >
            $
          </Text>
          <Text
            allowFontScaling
            style={[styles.priceValue, { color: text }]}
          >
            {precio.toLocaleString("es-AR")}
          </Text>
        </View>
      </View>

      <View style={styles.route}>
        <View style={styles.location}>
          <Ionicons
            name="location"
            size={18}
            color={primary}
            style={styles.locationIcon}
          />
          <View>
            <Text
              allowFontScaling
              style={[styles.locationLabel, { color: textSecondary }]}
            >
              Origen
            </Text>
            <Text
              allowFontScaling
              style={[styles.locationName, { color: text }]}
            >
              {origenLocalidad}
            </Text>
          </View>
        </View>

        <View style={styles.connector}>
          <View style={[styles.connectorLine, { backgroundColor: surfaceElevated }]} />
          <Ionicons name="chevron-forward" size={14} color={textSecondary} />
        </View>

        <View style={styles.location}>
          <Ionicons
            name="location"
            size={18}
            color={accent}
            style={styles.locationIcon}
          />
          <View>
            <Text
              allowFontScaling
              style={[styles.locationLabel, { color: textSecondary }]}
            >
              Destino
            </Text>
            <Text
              allowFontScaling
              style={[styles.locationName, { color: text }]}
            >
              {destinoLocalidad}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: surfaceElevated }]} />

      <View style={styles.details}>
        <View style={[styles.detailPill, { backgroundColor: surfaceElevated }]}>
          <Ionicons name="calendar-outline" size={14} color={textSecondary} />
          <Text
            allowFontScaling
            style={[styles.detailText, { color: textSecondary }]}
          >
            {fechaLabel}
          </Text>
        </View>
        <View style={[styles.detailPill, { backgroundColor: surfaceElevated }]}>
          <Ionicons name="time-outline" size={14} color={textSecondary} />
          <Text
            allowFontScaling
            style={[styles.detailText, { color: textSecondary }]}
          >
            {horarioSalida.substring(0, 5)} hs
          </Text>
        </View>
        <Badge variant={disponibilidadBaja ? "error" : "success"}>
          <Ionicons name="people-outline" size={12} color={disponibilidadBaja ? useThemeColor({}, "error") : useThemeColor({}, "success")} />
          {" "}{cantPasajeros} lugares
        </Badge>
      </View>

      <Button
        variant="primary"
        size="lg"
        onPress={() => onSelect(trip)}
        accessibilityLabel={`Reservar viaje de ${origenLocalidad} a ${destinoLocalidad} por ${precio.toLocaleString("es-AR")} pesos`}
        icon="chevron-forward"
        iconPosition="right"
      >
        Reservar ahora
      </Button>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  price: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  currency: {
    fontSize: 16,
    fontWeight: "700",
    marginRight: 2,
  },
  priceValue: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  route: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  location: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  locationIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  locationLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    fontWeight: "800",
    marginBottom: 2,
  },
  locationName: {
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 20,
  },
  connector: {
    flex: 0.4,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  connectorLine: {
    flex: 1,
    height: 2,
    borderRadius: 1,
    marginRight: 2,
  },
  divider: {
    height: 1,
    marginBottom: 14,
  },
  details: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
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
    fontSize: 13,
    fontWeight: "700",
  },
});
