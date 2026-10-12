import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { obtenerUsuariosConReservasSinVenta } from "../../../services/reportesService";
import { useAuth } from "../../../context/AuthContext";
import { Redirect } from "expo-router";

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
}

interface Pasajero {
  nombre: string;
  apellido: string;
  dni: string;
}

interface Reserva {
  id: number;
  usuarios_id: number;
  viajes_id: number;
  Usuario: Usuario;
  Viaje: {
    fechaViaje: string;
  };
  Pasajeros: Pasajero[];
}

export default function ReservasSinVentaScreen() {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout, userInfo } = useAuth();

  if (userInfo?.perfil !== "usuarioEmpresa") {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const respuesta = await obtenerUsuariosConReservasSinVenta(
          userInfo?.empresa_id
        );
        setReservas(respuesta.usuariosSinVenta);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Error al cargar las reservas");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const formatDate = (fechaISO: string) => {
    const [year, month, day] = fechaISO.split("T")[0].split("-").map(Number);
    return `${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reservas vencidas sin venta confirmada</Text>
      <FlatList
        data={reservas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.usuario}>
              {item.Usuario.nombre} {item.Usuario.apellido}
            </Text>
            <Text>Email: {item.Usuario.email}</Text>
            <Text>Usuario: {item.Usuario.usuario}</Text>
            <Text>N° Usuario: {item.Usuario.id}</Text>
            <Text>Fecha del viaje: {formatDate(item.Viaje.fechaViaje)}</Text>
            <Text style={styles.subtitulo}>Pasajeros:</Text>
            {item.Pasajeros.map((pasajero, index) => (
              <View key={index} style={styles.pasajeroCard}>
                <Text>
                  {pasajero.nombre} {pasajero.apellido} - DNI: {pasajero.dni}
                </Text>
              </View>
            ))}
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
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  usuario: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitulo: {
    marginTop: 8,
    fontWeight: "bold",
  },
  pasajeroCard: {
    backgroundColor: "#f0f0f0",
    marginTop: 4,
    padding: 6,
    borderRadius: 6,
  },
  error: {
    color: "red",
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
});
