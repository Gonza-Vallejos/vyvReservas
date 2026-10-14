import React, { useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { obtenerClientesConMasReservasPorEmpresa } from "../../../services/reportesService";
import { Redirect } from "expo-router";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";

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
  const { userInfo } = useAuth();

  if (userInfo?.perfil !== "usuarioEmpresa") {
    return <Redirect href="/(tabs)" />;
  }

  const fetchData = useCallback(
    () => obtenerClientesConMasReservasPorEmpresa(userInfo?.empresa_id),
    [userInfo?.empresa_id]
  );

  const { data: clientes = [], loading, error, refetch } = useAsyncData<Cliente[]>({
    fetchFn: fetchData,
    dependencies: [userInfo?.empresa_id],
  });

  const columns: DataTableColumn<Cliente>[] = [
    { key: "nombre", label: "Nombre", width: 120, render: (item) => item.Usuario.nombre },
    { key: "apellido", label: "Apellido", width: 120, render: (item) => item.Usuario.apellido },
    { key: "email", label: "Email", width: 180, render: (item) => item.Usuario.email },
    { key: "usuario", label: "Usuario", width: 120, render: (item) => item.Usuario.usuario },
    { key: "cantidadReservas", label: "Reservas", width: 90 },
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
      <Text style={styles.title}>Clientes con más reservas</Text>

      <Card style={styles.card}>
        <Text>
          <Text style={styles.label}>Total de clientes:</Text>{" "}
          {clientes.length}
        </Text>
      </Card>

      <DataTable
        columns={columns}
        data={clientes}
        keyExtractor={(item) => item.usuarios_id.toString()}
        emptyMessage="No hay clientes con reservas."
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
