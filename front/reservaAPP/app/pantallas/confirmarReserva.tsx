import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import {
  listarReservasYPasajerosPorViaje,
  eliminarPasajero,
} from "../../services/reservaService";
import { existeReservaVenta } from "../../services/ventaService";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { formatDate } from "@/utils/dateFormatter";

export interface Pasajero {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
}

export interface ReservaConPasajeros {
  reservaId: number;
  fechaReserva: string;
  usuarios_id: number;
  pasajeros: Pasajero[];
  tieneVenta?: boolean;
}

export default function ReservasYPasajerosScreen() {
  const { id, origen, destino, fecha, hora } = useLocalSearchParams();
  const { isLoading, userInfo } = useAuth();

  if (!isLoading && userInfo?.perfil !== "usuarioChofer") {
    return <Redirect href="/(tabs)" />;
  }

  const fetchReservas = useCallback(async () => {
    const data = await listarReservasYPasajerosPorViaje(Number(id));
    const reservasConVenta = await Promise.all(
      data.map(async (reserva: ReservaConPasajeros) => ({
        ...reserva,
        tieneVenta: await existeReservaVenta(reserva.reservaId),
      }))
    );
    return reservasConVenta;
  }, [id]);

  const { data: reservas = [], loading, error, refetch } = useAsyncData<
    ReservaConPasajeros[]
  >({
    fetchFn: fetchReservas,
    dependencies: [id],
  });

  const reservasPendientes = reservas.filter((r) => !r.tieneVenta);
  const reservasConfirmadas = reservas.filter((r) => r.tieneVenta);

  const handleEliminar = (idPasajero: number, reservaId: number) => {
    const reserva = reservasPendientes.find((r) => r.reservaId === reservaId);
    const cantidadPasajeros = reserva?.pasajeros.length ?? 0;

    const mensaje =
      cantidadPasajeros === 1
        ? "Este es el último pasajero. Si lo eliminás, se eliminará la reserva completa. ¿Deseás continuar?"
        : "¿Estás seguro de que querés eliminar este pasajero?";

    const confirmar = async () => {
      try {
        await eliminarPasajero(idPasajero);
        if (cantidadPasajeros === 1) {
          router.replace("/(tabs)/choferReserva");
          return;
        }
        refetch();
      } catch (error) {
        Alert.alert("Error", "No se pudo eliminar el pasajero");
      }
    };

    if (Platform.OS === "web") {
      if (window.confirm(mensaje)) confirmar();
    } else {
      Alert.alert("Confirmar eliminación", mensaje, [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: confirmar },
      ]);
    }
  };

  const columns: DataTableColumn<Pasajero>[] = [
    { key: "nombre", label: "Nombre", width: 110 },
    { key: "apellido", label: "Apellido", width: 110 },
    { key: "dni", label: "DNI", width: 100 },
    { key: "ubicacionOrigen", label: "Ubi. Origen", width: 120 },
    { key: "ubicacionDestino", label: "Ubi. Destino", width: 120 },
  ];

  const columnsConAccion: DataTableColumn<Pasajero>[] = [
    ...columns,
    {
      key: "acciones",
      label: "Eliminar",
      width: 80,
      render: (item) => (
        <Pressable
          onPress={() => handleEliminar(item.id, Number(id))}
          accessibilityLabel="Eliminar pasajero"
          accessibilityRole="button"
        >
          <Ionicons name="trash-bin-outline" size={22} color="#E53935" />
        </Pressable>
      ),
    },
  ];

  const renderReserva = (item: ReservaConPasajeros, editable: boolean) => (
    <Card key={item.reservaId} style={styles.card}>
      <Text style={styles.label}>
        Fecha Reserva: {formatDate(item.fechaReserva)} | {origen} ➜ {destino} |{" "}
        {fecha} - {hora}hs
      </Text>

      <DataTable
        columns={editable ? columnsConAccion : columns}
        data={item.pasajeros}
        keyExtractor={(p) => p.id.toString()}
        emptyMessage="No hay pasajeros en esta reserva."
      />

      {editable && (
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            size="md"
            onPress={() =>
              router.push({
                pathname: "/pantallas/ventaReserva",
                params: { id: item.reservaId },
              })
            }
          >
            Confirmar
          </Button>
        </View>
      )}
    </Card>
  );

  return (
    <ScreenContainer
      loading={loading || isLoading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
      {reservasPendientes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Reservas pendientes de confirmación
          </Text>
          {reservasPendientes.map((r) => renderReserva(r, true))}
        </>
      )}

      {reservasConfirmadas.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Reservas confirmadas</Text>
          {reservasConfirmadas.map((r) => renderReserva(r, false))}
        </>
      )}

      {reservasPendientes.length === 0 && reservasConfirmadas.length === 0 && (
        <Text style={styles.emptyMessage}>
          No hay reservas registradas para este viaje.
        </Text>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  card: {
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#4c68d7",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  emptyMessage: {
    textAlign: "center",
    color: "#777",
    marginTop: 40,
    fontSize: 16,
  },
});
