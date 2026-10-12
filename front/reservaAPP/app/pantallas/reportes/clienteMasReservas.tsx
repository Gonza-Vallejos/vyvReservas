import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { obtenerClientesConMasReservasPorEmpresa } from "../../../services/reportesService";
import { Redirect } from "expo-router";

interface Cliente {
  usuarios_id: number;
  cantidadReservas: number;
  Usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    usuario: string;
  };
}

export default function TopClientesScreen() {
  const { logout, userInfo } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (userInfo?.perfil !== "usuarioEmpresa") {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const respuesta = await obtenerClientesConMasReservasPorEmpresa(
          userInfo?.empresa_id
        );
        setClientes(respuesta.topClientes);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            "Error al obtener clientes con más reservas"
        );
      } finally {
        setLoading(false);
      }
    };

    cargarClientes();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  if (error) {
    return <Text style={styles.error}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Clientes con Más Reservas</Text>
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.usuarios_id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.nombre}>
              {item.Usuario.nombre} {item.Usuario.apellido}
            </Text>
            <Text>Email: {item.Usuario.email}</Text>
            <Text>Usuario: {item.Usuario.usuario}</Text>
            <Text>N° Usuario: {item.Usuario.id}</Text>
            <Text>Cantidad de reservas: {item.cantidadReservas}</Text>
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
  nombre: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  error: {
    color: "red",
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
});
