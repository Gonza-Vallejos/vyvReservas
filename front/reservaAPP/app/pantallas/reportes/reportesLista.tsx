import React from "react";
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Button from "@/components/ui/Button";

type RutaReporte =
  | "/pantallas/reportes/pasajerosEmpresa"
  | "/pantallas/reportes/viajesTransportes"
  | "/pantallas/reportes/viajesReservados"
  | "/pantallas/reportes/clienteMasReservas"
  | "/pantallas/reportes/clientesVentasConfirmadas"
  | "/pantallas/reportes/gananciaTotal"
  | "/pantallas/reportes/gananciaPorViaje";

export default function ReportesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isLoading, userInfo } = useAuth();

  if (!isLoading && userInfo?.perfil !== "usuarioEmpresa") {
    return <Redirect href="/(tabs)" />;
  }

  const botones: { texto: string; ruta: RutaReporte }[] = [
    { texto: "Pasajeros por Empresa", ruta: "/pantallas/reportes/pasajerosEmpresa" },
    { texto: "Viajes por Transporte", ruta: "/pantallas/reportes/viajesTransportes" },
    { texto: "Viajes más Reservados", ruta: "/pantallas/reportes/viajesReservados" },
    { texto: "Cliente con más Reservas", ruta: "/pantallas/reportes/clienteMasReservas" },
    { texto: "Clientes con Ventas Confirmadas", ruta: "/pantallas/reportes/clientesVentasConfirmadas" },
    { texto: "Ganancia Total", ruta: "/pantallas/reportes/gananciaTotal" },
    { texto: "Ganancia Total por Viaje", ruta: "/pantallas/reportes/gananciaPorViaje" },
  ];

  return (
    <ScreenContainer
      loading={isLoading}
      contentContainerStyle={styles.container}
      scrollEnabled
    >
      <Text style={styles.title}>Seleccioná un tipo de reporte</Text>

      <View style={[styles.grid, width > 600 && styles.gridWeb]}>
        {botones.map((btn, i) => (
          <Button
            key={i}
            variant="primary"
            size="md"
            onPress={() => router.push(btn.ruta)}
            style={styles.button}
          >
            {btn.texto}
          </Button>
        ))}
      </View>

      <Button
        variant="secondary"
        size="md"
        onPress={() => router.back()}
        style={styles.backButton}
      >
        Volver
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  grid: {
    flexDirection: "column",
    gap: 12,
  },
  gridWeb: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  button: {
    minWidth: 160,
    marginBottom: 10,
  },
  backButton: {
    marginTop: 50,
    alignSelf: "center",
    width: "20%",
    minWidth: 140,
  },
});
