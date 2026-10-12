import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useAuth } from "../../../context/AuthContext";
import { useEffect } from "react";

export default function ReportesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { isLoading, logout, userInfo } = useAuth();

  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioEmpresa") {
      logout();
      router.replace("/login");
    }
  }, [isLoading, userInfo]);

  if (isLoading || !userInfo) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  type RutaReporte =
    | "/pantallas/reportes/reportesReservas"
    | "/pantallas/reportes/pasajerosEmpresa"
    | "/pantallas/reportes/viajesTransportes"
    | "/pantallas/reportes/viajesReservados"
    | "/pantallas/reportes/clienteMasReservas"
    | "/pantallas/reportes/clientesVentasConfirmadas"
    | "/pantallas/reportes/gananciaTotal"
    | "/pantallas/reportes/gananciaPorViaje";

  const botones: { texto: string; ruta: RutaReporte }[] = [
    {
      texto: "Pasajeros por Empresa",
      ruta: "/pantallas/reportes/pasajerosEmpresa",
    },
    {
      texto: "Viajes por Transporte",
      ruta: "/pantallas/reportes/viajesTransportes",
    },
    {
      texto: "Viajes más Reservados",
      ruta: "/pantallas/reportes/viajesReservados",
    },
    {
      texto: "Cliente con más Reservas",
      ruta: "/pantallas/reportes/clienteMasReservas",
    },
    {
      texto: "Clientes con Ventas Confirmadas",
      ruta: "/pantallas/reportes/clientesVentasConfirmadas",
    },
    { texto: "Ganancia Total", ruta: "/pantallas/reportes/gananciaTotal" },
    {
      texto: "Ganancia Total por Viaje",
      ruta: "/pantallas/reportes/gananciaPorViaje",
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Seleccioná un tipo de reporte</Text>

        <View style={[styles.grid, width > 600 && styles.gridWeb]}>
          {botones.map((btn, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.button,
                pressed && { backgroundColor: "#3b55b3" },
              ]}
              onPress={() => router.push(btn.ruta)}
            >
              <Text style={styles.buttonText}>{btn.texto}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            styles.logoutButton,
            pressed && { backgroundColor: "#5c636a" },
          ]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Volver</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  scrollContainer: {
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
    backgroundColor: "#4c68d7",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 160,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  logoutButton: {
    backgroundColor: "#6c757d",
    marginTop: 50,
    alignSelf: "center",
    width: "20%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});
