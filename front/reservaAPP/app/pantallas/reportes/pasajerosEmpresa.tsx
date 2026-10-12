import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { obtenerPasajerosPorEmpresa } from "../../../services/reportesService";
import { Redirect } from "expo-router";

interface ReservaViaje {
  reservaId: number;
  viajeId: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  fechaViaje: string;
  horarioSalida: string;
}

interface PasajeroEmpresa {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
  reserva: ReservaViaje | null;
}

export default function PasajerosPorEmpresaScreen() {
  const { logout, userInfo } = useAuth();
  const [pasajeros, setPasajeros] = useState<PasajeroEmpresa[]>([]);
  const [cantidad, setCantidad] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (userInfo?.perfil !== "usuarioEmpresa") {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const cargarPasajeros = async () => {
      try {
        const respuesta = await obtenerPasajerosPorEmpresa(
          userInfo?.empresa_id
        );
        setPasajeros(respuesta.pasajeros);
        setCantidad(respuesta.cantidadPasajeros);
      } catch (err: any) {
        setError(err?.response?.data?.mensaje || "Error al obtener pasajeros");
      } finally {
        setLoading(false);
      }
    };

    cargarPasajeros();
  }, []);

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
      <Text style={styles.title}>Pasajeros de la Empresa</Text>
      <Text style={styles.subTitle}>Cantidad total: {cantidad}</Text>

      <FlatList
        data={pasajeros}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nombre}>
              {item.nombre} {item.apellido}
            </Text>
            <Text>DNI: {item.dni}</Text>
            <Text>Desde: {item.ubicacionOrigen}</Text>
            <Text>Hasta: {item.ubicacionDestino}</Text>

            {item.reserva && (
              <View style={styles.viajeBox}>
                <Text style={styles.label}>🚍 Viaje:</Text>
                <Text>Origen: {item.reserva.origenLocalidad}</Text>
                <Text>Destino: {item.reserva.destinoLocalidad}</Text>
                <Text>Fecha: {formatDate(item.reserva.fechaViaje)}</Text>
                <Text>Hora: {formatTime(item.reserva.horarioSalida)}</Text>
              </View>
            )}
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
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  viajeBox: {
    marginTop: 10,
    backgroundColor: "#e6f2ff",
    padding: 10,
    borderRadius: 8,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  error: {
    color: "red",
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
});
