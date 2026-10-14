import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Redirect, useLocalSearchParams } from "expo-router";
import { obtenerPasajerosPorViaje } from "../../../services/reportesService";
import { useAuth } from "../../../context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { formatDate, formatTime } from "@/utils/dateFormatter";

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
  const { userInfo } = useAuth();

  if (userInfo?.perfil !== "usuarioEmpresa") {
    return <Redirect href="/(tabs)" />;
  }

  const fetchData = useCallback(
    () => obtenerPasajerosPorViaje(Number(id)),
    [id]
  );

  const { data, loading, error, refetch } = useAsyncData<RespuestaPasajerosPorViaje>({
    fetchFn: fetchData,
    dependencies: [id],
  });

  const columns: DataTableColumn<Pasajero>[] = [
    { key: "nombre", label: "Nombre", width: 110 },
    { key: "apellido", label: "Apellido", width: 110 },
    { key: "dni", label: "DNI", width: 100 },
    { key: "ubicacionOrigen", label: "Origen", width: 120 },
    { key: "ubicacionDestino", label: "Destino", width: 120 },
  ];

  return (
    <ScreenContainer
      loading={loading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.title}>Pasajeros del Viaje</Text>

      {data?.viaje && (
        <Card style={styles.card}>
          <Text>
            <Text style={styles.label}>Origen:</Text> {data.viaje.origenLocalidad}
          </Text>
          <Text>
            <Text style={styles.label}>Destino:</Text> {data.viaje.destinoLocalidad}
          </Text>
          <Text>
            <Text style={styles.label}>Fecha:</Text>{" "}
            {formatDate(data.viaje.fechaViaje)}
          </Text>
          <Text>
            <Text style={styles.label}>Hora de salida:</Text>{" "}
            {formatTime(data.viaje.horarioSalida)}
          </Text>
          <Text>
            <Text style={styles.label}>Cantidad de pasajeros:</Text>{" "}
            {data.cantidadPasajeros}
          </Text>
        </Card>
      )}

      <DataTable
        columns={columns}
        data={data?.pasajeros || []}
        keyExtractor={(item) => item.id.toString()}
        emptyMessage="No hay pasajeros registrados."
      />
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
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    marginBottom: 20,
  },
  label: {
    fontWeight: "bold",
  },
});
