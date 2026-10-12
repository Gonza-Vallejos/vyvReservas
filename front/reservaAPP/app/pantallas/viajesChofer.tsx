import React, { useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

interface Viaje {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  fechaViaje: string;
  horarioSalida: string;
  precio: number;
}

export default function ChoferListaViajes() {
  const { viajes } = useLocalSearchParams();
  const router = useRouter();
  const { isLoading, logout, userInfo } = useAuth();

  // Convertimos el string de JSON a un array real
  let listaViajes: Viaje[] = [];

  try {
    listaViajes = viajes ? JSON.parse(viajes as string) : [];
  } catch (error) {
    console.error("Error al parsear los viajes:", error);
  }
  const formatDate = (fechaISO: string) => {
    const [year, month, day] = fechaISO.split("T")[0].split("-").map(Number);
    return `${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioMostrador") {
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Viajes asignados</Text>
      <FlatList
        data={listaViajes}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>Origen: {item.origenLocalidad}</Text>
            <Text>Destino: {item.destinoLocalidad}</Text>
            <Text>Fecha: {formatDate(item.fechaViaje)}</Text>
            <Text>Horario: {formatTime(item.horarioSalida)}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No hay viajes disponibles.</Text>}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  card: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 10,
  },
});
