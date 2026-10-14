import React, { useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { obtenerClientesConVentasConfirmadasPorEmpresa } from "../../../services/reportesService";
import { Redirect, router } from "expo-router";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

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
  const { userInfo } = useAuth();

  if (userInfo?.perfil !== "usuarioEmpresa") {
    return <Redirect href="/(tabs)" />;
  }

  const fetchData = useCallback(
    () => obtenerClientesConVentasConfirmadasPorEmpresa(userInfo?.empresa_id),
    [userInfo?.empresa_id]
  );

  const { data: clientes, loading, error, refetch } = useAsyncData<{
    topClientes: ClienteConVenta[];
  }>({
    fetchFn: fetchData,
    dependencies: [userInfo?.empresa_id],
  });

  return (
    <ScreenContainer
      loading={loading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Clientes con Ventas Confirmadas</Text>
      </View>

      <Button
        variant="primary"
        size="md"
        onPress={() =>
          router.push("/pantallas/reportes/clientesVentasNoConfirmadas")
        }
        style={styles.navButton}
      >
        Ventas no Confirmadas
      </Button>

      {clientes?.topClientes?.length === 0 ? (
        <Text style={styles.empty}>No hay clientes con ventas confirmadas.</Text>
      ) : (
        clientes?.topClientes?.map((item, index) => (
          <Card key={item.usuarios_id} style={styles.card}>
            <Text style={styles.nombre}>
              {index + 1}. {item.Usuario.nombre} {item.Usuario.apellido}
            </Text>
            <Text>Email: {item.Usuario.email}</Text>
            <Text>Usuario: {item.Usuario.usuario}</Text>
            <Text>N° Usuario: {item.Usuario.id}</Text>
            <Text>Cantidad de reservas con venta: {item.cantidadReservas}</Text>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
  },
  nombre: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  empty: {
    color: "gray",
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
  navButton: {
    marginBottom: 16,
  },
});
