import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Platform,
  ToastAndroid,
} from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { obtenerPasajerosPorViaje } from "../../services/viajeServices";
import { eliminarPasajero } from "../../services/reservaService";

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

  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensajeReserva, setMensajeReserva] = useState("");
  const [esError, setEsError] = useState(false);
  const router = useRouter();
  const { isLoading, logout, userInfo } = useAuth();
  const usuarios_id = userInfo?.id;

  useEffect(() => {
    if (id) {
      setLoading(true);
      obtenerPasajerosPorViaje(Number(idReserva))
        .then((data) => {
          setPasajeros(data);
        })
        .catch((error) => {
          setEsError(true);
          setMensajeReserva("Error al obtener los pasajeros");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, updated]);

  const handleEliminar = (idPasajero: number) => {
    const cantidadPasajeros = pasajeros.length;

    const mensaje =
      cantidadPasajeros === 1
        ? "Este es el último pasajero. Si lo eliminás, se eliminará la reserva completa. ¿Deseás continuar?"
        : "¿Estás seguro de que querés eliminar este pasajero?";

    if (Platform.OS === "web") {
      const confirmacion = window.confirm(mensaje);
      if (confirmacion) {
        eliminarYActualizar(idPasajero, cantidadPasajeros);
      }
    } else {
      Alert.alert("Confirmar eliminación", mensaje, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => eliminarYActualizar(idPasajero, cantidadPasajeros),
        },
      ]);
    }
  };

  // Elimina y redirige si era el último
  const eliminarYActualizar = async (
    idPasajero: number,
    cantidadPasajeros: number
  ) => {
    try {
      await eliminarPasajero(idPasajero);

      // Mostrar mensaje de éxito
      if (Platform.OS === "web") {
        alert("Pasajero eliminado correctamente");
      } else {
        Alert.alert("Pasajero eliminado correctamente");
      }

      // Si era el último pasajero
      if (cantidadPasajeros === 1) {
        router.replace("/(tabs)/reserva");
        return;
      }

      // Si no era el último: actualiza la lista
      router.push({
        pathname: "/pantallas/detalleReserva",
        params: { id: id, tieneVenta: tieneVenta, idReserva: idReserva },
      });
    } catch (error) {
      console.error("Error al eliminar pasajero:", error);

      if (Platform.OS === "web") {
        alert("Error al eliminar pasajero");
      } else {
        Alert.alert("Error al eliminar pasajero");
      }
    }
  };

  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioCliente") {
      logout();
      router.replace("/login");
    }
  }, [isLoading, userInfo]);

  if (isLoading || !userInfo) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (esError) {
    return (
      <View style={styles.container}>
        <Text>{mensajeReserva}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.subTitle}>Pasajeros:</Text>
      <FlatList
        data={pasajeros}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.pasajeroCard}>
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
                <TouchableOpacity
                  style={styles.botonEditar}
                  onPress={() =>
                    router.push({
                      pathname: "/pantallas/modificarPasajero",
                      params: {
                        id: item.id,
                        idReserva: idReserva,
                        idViaje: id,
                      },
                    })
                  }
                >
                  <Text style={styles.botonTexto}>Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.botonEliminar}
                  onPress={() => handleEliminar(item.id)}
                >
                  <Text style={styles.botonTexto}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            )}
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
    backgroundColor: "#f4f6f8",
  },
  subTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 16,
    color: "#333",
  },

  pasajeroCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
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
  botonEditar: {
    backgroundColor: "#4c68d7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
  },
  botonEliminar: {
    backgroundColor: "#f44336",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
