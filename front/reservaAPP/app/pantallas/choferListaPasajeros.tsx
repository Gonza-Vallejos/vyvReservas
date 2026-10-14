import React, { useCallback } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import {
  listarPasajeroPorViaje,
  eliminarPasajero,
} from "../../services/reservaService";
import { existeVentaPorPasajero } from "../../services/ventaService";
import { useAuth } from "../../context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Card from "@/components/ui/Card";

interface Pasajero {
  id: number;
  nombre: string;
  apellido: string;
  dni: number;
  ubicacionOrigen: string;
  ubicacionDestino: string;
  tieneVenta?: boolean;
}

const EstadoAsiento = ({ tieneVenta }: { tieneVenta?: boolean }) => (
  <Image
    source={
      tieneVenta
        ? require("../../assets/images/icons8-asiento-50.png")
        : require("../../assets/images/icons8-car-seat-50.png")
    }
    style={styles.iconoEstado}
  />
);

export default function ChoferListaPasajeros() {
  const { id, origen, destino } = useLocalSearchParams();
  const router = useRouter();
  const { isLoading, userInfo } = useAuth();

  if (
    !isLoading &&
    userInfo?.perfil !== "usuarioChofer" &&
    userInfo?.perfil !== "usuarioEmpresa" &&
    userInfo?.perfil !== "usuarioMostrador"
  ) {
    return <Redirect href="/(tabs)" />;
  }

  const fetchPasajeros = useCallback(async () => {
    const data = await listarPasajeroPorViaje(Number(id));
    const pasajerosConVenta = await Promise.all(
      data.map(async (p: Pasajero) => ({
        ...p,
        tieneVenta: await existeVentaPorPasajero(p.id),
      }))
    );
    return pasajerosConVenta;
  }, [id]);

  const { data: pasajeros = [], loading, error, refetch } = useAsyncData<Pasajero[]>({
    fetchFn: fetchPasajeros,
    dependencies: [id],
  });

  const columns: DataTableColumn<Pasajero>[] = [
    { key: "nombre", label: "Nombre", width: 110 },
    { key: "apellido", label: "Apellido", width: 110 },
    { key: "dni", label: "DNI", width: 100 },
    { key: "ubicacionOrigen", label: "Ubi. Origen", width: 120 },
    { key: "ubicacionDestino", label: "Ubi. Destino", width: 120 },
    {
      key: "tieneVenta",
      label: "Confirmado",
      width: 90,
      render: (item) => <EstadoAsiento tieneVenta={item.tieneVenta} />,
    },
  ];

  return (
    <ScreenContainer
      loading={loading || isLoading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>
        {origen} ➜ {destino}
      </Text>

      <Card>
        <DataTable
          columns={columns}
          data={pasajeros}
          keyExtractor={(item) => item.id.toString()}
          emptyMessage="No hay pasajeros en este viaje."
        />
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  iconoEstado: {
    width: 24,
    height: 24,
    alignSelf: "center",
  },
});
