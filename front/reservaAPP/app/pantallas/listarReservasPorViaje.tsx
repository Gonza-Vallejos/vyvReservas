import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { Redirect, useRouter, useLocalSearchParams } from "expo-router";
import { listarReservasPorViaje } from "../../services/reservaService";
import { useAuth } from "../../context/AuthContext";
interface Usuario {
  nombre: string;
  apellido: string;
}

interface Pasajero {
  nombre: string;
  apellido: string;
}

interface Reserva {
  id: number;
  fechaReserva: string;
  usuarios_id: number;
  Usuario?: Usuario;
  Pasajeros?: Pasajero[];
}

const ReservasPorViaje = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const { isLoading, logout, userInfo } = useAuth();

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        if (!id) return;
        const data = await listarReservasPorViaje(Number(id));
        setReservas(data);
      } catch (error) {
        console.error("Error al obtener reservas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
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

  useEffect(() => {
    if (
      !isLoading &&
      userInfo?.perfil !== "usuarioEmpresa" &&
      userInfo?.perfil !== "usuarioMostrador"
    ) {
      logout();
      router.replace("/login");
    }
  }, [isLoading, userInfo]);

  if (isLoading || !userInfo) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (reservas.length === 0) {
    return (
      <View style={styles.centered}>
        <Text>No hay reservas para este viaje.</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={reservas}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.reservaItem}>
          <Text style={styles.reservaTitulo}>Reserva #{item.id}</Text>
          <Text>Fecha de reserva: {formatDate(item.fechaReserva)}</Text>

          {item.Usuario && (
            <Text>
              Realizada por: {item.Usuario.nombre} {item.Usuario.apellido}
            </Text>
          )}
          {item.Pasajeros && item.Pasajeros.length > 0 && (
            <View style={styles.pasajeroLista}>
              <Text style={{ fontWeight: "bold", marginBottom: 6 }}>
                Pasajeros:
              </Text>
              {item.Pasajeros.map((pasajero, index) => (
                <Text key={index} style={styles.pasajeroItem}>
                  • {pasajero.nombre} {pasajero.apellido}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  reservaItem: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#17a589",
  },
  reservaTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 6,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  pasajeroLista: {
    marginTop: 6,
    backgroundColor: "#f0f4f7",
    borderRadius: 10,
    padding: 10,
  },
  pasajeroItem: {
    fontSize: 14,
    marginBottom: 2,
    color: "#333",
  },
});

export default ReservasPorViaje;
