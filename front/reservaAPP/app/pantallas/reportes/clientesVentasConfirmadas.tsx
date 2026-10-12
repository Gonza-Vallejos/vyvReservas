import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { obtenerClientesConVentasConfirmadasPorEmpresa } from "../../../services/reportesService";
import { Ionicons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";

interface ClienteConVenta {
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

export default function TopClientesConVentasScreen() {
  const { logout, userInfo } = useAuth();
  const [clientes, setClientes] = useState<ClienteConVenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (userInfo?.perfil !== "usuarioEmpresa") {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const cargarClientes = async () => {
      try {
        const respuesta = await obtenerClientesConVentasConfirmadasPorEmpresa(
          userInfo?.empresa_id
        );
        setClientes(respuesta.topClientes);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            "Error al obtener clientes con ventas confirmadas"
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
      <View style={styles.header}>
        <Text style={styles.title}>Clientes con Ventas Confirmadas</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() =>
            router.push("/pantallas/reportes/clientesVentasNoConfirmadas")
          }
        >
          <Text style={styles.buttonText}>Ventas no Confirmadas</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={clientes}
        keyExtractor={(item) => item.usuarios_id.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text style={styles.nombre}>
              {index + 1}. {item.Usuario.nombre} {item.Usuario.apellido}
            </Text>
            <Text>Email: {item.Usuario.email}</Text>
            <Text>Usuario: {item.Usuario.usuario}</Text>
            <Text>N° Usuario: {item.Usuario.id}</Text>
            <Text>Cantidad de reservas con venta: {item.cantidadReservas}</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconButton: {
    backgroundColor: "#4c68d7",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginVertical: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  buttonContainer: {
    marginTop: 10,
    alignItems: "flex-start",
  },
});
