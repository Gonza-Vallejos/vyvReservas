import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import { obtenerPasajerosPorViaje } from "../../../services/reportesService";
import { useAuth } from "../../../context/AuthContext";

interface Viaje {
  origenLocalidad: string;
  destinoLocalidad: string;
  fechaViaje: string;
  horarioSalida: string;
}

interface Pasajero {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
}

interface RespuestaPasajerosPorViaje {
  viaje: Viaje;
  cantidadPasajeros: number;
  pasajeros: Pasajero[];
}

export default function PasajerosPorViajeScreen() {
  const { id } = useLocalSearchParams();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [cantidad, setCantidad] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout, userInfo } = useAuth();

  if (userInfo?.perfil !== "usuarioEmpresa") {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const cargarPasajeros = async () => {
      try {
        const respuesta: RespuestaPasajerosPorViaje =
          await obtenerPasajerosPorViaje(Number(id));
        setViaje(respuesta.viaje);
        setPasajeros(respuesta.pasajeros);
        setCantidad(respuesta.cantidadPasajeros);
      } catch (err: any) {
        setError(err?.response?.data?.mensaje || "Error al obtener pasajeros");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      cargarPasajeros();
    }
  }, [id]);

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
  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pasajeros del Viaje</Text>
      {viaje && (
        <View style={styles.card}>
          <Text>
            <Text style={styles.label}>Origen:</Text> {viaje.origenLocalidad}
          </Text>
          <Text>
            <Text style={styles.label}>Destino:</Text> {viaje.destinoLocalidad}
          </Text>
          <Text>
            <Text style={styles.label}>Fecha:</Text>{" "}
            {formatDate(viaje.fechaViaje)}
          </Text>
          <Text>
            <Text style={styles.label}>Hora de salida:</Text>{" "}
            {formatTime(viaje.horarioSalida)}
          </Text>
          <Text>
            <Text style={styles.label}>Cantidad de pasajeros:</Text> {cantidad}
          </Text>
        </View>
      )}

      <FlatList
        data={pasajeros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.pasajeroCard}>
            <Text style={styles.pasajeroNombre}>
              {item.nombre} {item.apellido}
            </Text>
            <Text>DNI: {item.dni}</Text>
            <Text>Desde: {item.ubicacionOrigen}</Text>
            <Text>Hasta: {item.ubicacionDestino}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f2f2f2",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  label: {
    fontWeight: "bold",
  },
  pasajeroCard: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 1,
  },
  pasajeroNombre: {
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "red",
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
});
