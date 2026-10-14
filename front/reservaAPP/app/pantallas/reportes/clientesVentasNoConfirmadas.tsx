import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { obtenerUsuariosConReservasSinVenta } from "../../../services/reportesService";
import { useAuth } from "../../../context/AuthContext";
import { Redirect } from "expo-router";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { formatDate } from "@/utils/dateFormatter";

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
  const { userInfo } = useAuth();

  if (userInfo?.perfil !== "usuarioEmpresa") {
    return <Redirect href="/(tabs)" />;
  }

  const fetchData = useCallback(
    () => obtenerUsuariosConReservasSinVenta(userInfo?.empresa_id),
    [userInfo?.empresa_id]
  );

  const { data, loading, error, refetch } = useAsyncData<{
    usuariosSinVenta: Reserva[];
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
      <Text style={styles.title}>Reservas vencidas sin venta confirmada</Text>

      {data?.usuariosSinVenta?.length === 0 ? (
        <Text style={styles.empty}>No hay reservas sin venta confirmada.</Text>
      ) : (
        data?.usuariosSinVenta?.map((item) => (
          <Card key={item.id} style={styles.card}>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  card: {
    marginBottom: 16,
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
  empty: {
    color: "gray",
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
  },
});
