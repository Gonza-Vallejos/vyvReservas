import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { obtenerPasajerosPorEmpresa } from "../../../services/reportesService";
import { Redirect } from "expo-router";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { formatDate, formatTime } from "@/utils/dateFormatter";

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
  const { userInfo } = useAuth();

  if (userInfo?.perfil !== "usuarioEmpresa") {
    return <Redirect href="/(tabs)" />;
  }

  const fetchData = useCallback(
    () => obtenerPasajerosPorEmpresa(userInfo?.empresa_id),
    [userInfo?.empresa_id]
  );

  const { data, loading, error, refetch } = useAsyncData<{
    cantidad: number;
    pasajeros: PasajeroEmpresa[];
  }>({
    fetchFn: fetchData,
    dependencies: [userInfo?.empresa_id],
  });

  const columns: DataTableColumn<PasajeroEmpresa>[] = [
    { key: "nombre", label: "Nombre", width: 110 },
    { key: "apellido", label: "Apellido", width: 110 },
    { key: "dni", label: "DNI", width: 100 },
    { key: "ubicacionOrigen", label: "Origen", width: 120 },
    { key: "ubicacionDestino", label: "Destino", width: 120 },
    {
      key: "reserva",
      label: "Viaje",
      width: 180,
      render: (item) =>
        item.reserva ? (
          <Text style={{ fontSize: 13 }}>
            {item.reserva.origenLocalidad} ➜ {item.reserva.destinoLocalidad}{" "}
            {"\n"}
            {formatDate(item.reserva.fechaViaje)} -{" "}
            {formatTime(item.reserva.horarioSalida)}
          </Text>
        ) : (
          <Text style={{ fontSize: 13, color: "#888" }}>Sin viaje</Text>
        ),
    },
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
      <Text style={styles.title}>Pasajeros de la Empresa</Text>

      <Card style={styles.card}>
        <Text>
          <Text style={styles.label}>Total de pasajeros:</Text>{" "}
          {data?.cantidad ?? 0}
        </Text>
      </Card>

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
  container: { padding: 16, paddingBottom: 32 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  card: { marginBottom: 20 },
  label: { fontWeight: "bold" },
});
