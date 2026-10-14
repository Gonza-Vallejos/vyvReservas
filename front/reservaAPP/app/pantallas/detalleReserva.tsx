import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Alert, Platform } from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { obtenerPasajerosPorViaje } from "../../services/viajeServices";
import { eliminarPasajero } from "../../services/reservaService";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface Pasajero {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
}

export default function DetalleReserva() {
  const { id, updated, tieneVenta, idReserva } = useLocalSearchParams();
  const reservaConfirmada = tieneVenta === "true";
  const router = useRouter();
  const { isLoading, userInfo } = useAuth();

  if (!isLoading && !userInfo) {
    return <Redirect href="/login" />;
  }

  const fetchPasajeros = useCallback(
    () => obtenerPasajerosPorViaje(Number(idReserva)),
    [idReserva, updated]
  );

  const { data: pasajeros = [], loading, error, refetch } = useAsyncData<Pasajero[]>({
    fetchFn: fetchPasajeros,
    dependencies: [idReserva, updated],
  });

  const handleEliminar = (pasajero: Pasajero) => {
    const cantidadPasajeros = pasajeros.length;
    const mensaje =
      cantidadPasajeros === 1
        ? "Este es el último pasajero. Si lo eliminás, se eliminará la reserva completa. ¿Deseás continuar?"
        : "¿Estás seguro de que querés eliminar este pasajero?";

    const confirmar = async () => {
      try {
        await eliminarPasajero(pasajero.id);
        if (cantidadPasajeros === 1) {
          router.replace("/(tabs)/reserva");
          return;
        }
        refetch();
      } catch (err) {
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

  return (
    <ScreenContainer
      loading={loading || isLoading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.subTitle}>Pasajeros:</Text>

      {pasajeros.map((item) => (
        <Card key={item.id} style={styles.pasajeroCard}>
          <View style={styles.infoContainer}>
            <Text style={styles.nombre}>
              {item.nombre} {item.apellido}
            </Text>
            <Text style={styles.dato}>
              DNI: <Text style={styles.valor}>{item.dni}</Text>
            </Text>
            <Text style={styles.dato}>
              Origen: <Text style={styles.valor}>{item.ubicacionOrigen}</Text>
            </Text>
            <Text style={styles.dato}>
              Destino:{" "}
              <Text style={styles.valor}>{item.ubicacionDestino}</Text>
            </Text>
          </View>

          {!reservaConfirmada && (
            <View style={styles.botonesRow}>
              <Button
                variant="primary"
                size="sm"
                onPress={() =>
                  router.push({
                    pathname: "/pantallas/modificarPasajero",
                    params: {
                      id: item.id,
                      idReserva,
                      idViaje: id,
                    },
                  })
                }
              >
                Editar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onPress={() => handleEliminar(item)}
              >
                Eliminar
              </Button>
            </View>
          )}
        </Card>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  subTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 16,
    color: "#333",
  },
  pasajeroCard: {
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 12,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 4,
  },
  dato: {
    fontSize: 14,
    color: "#555",
    marginBottom: 2,
  },
  valor: {
    fontWeight: "600",
    color: "#333",
  },
  botonesRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
});
