import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
  Pressable,
  Alert,
  Image,
} from "react-native";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import {
  listarReservasYPasajerosPorViaje,
  eliminarPasajero,
} from "../../services/reservaService";
import { existeReservaVenta } from "../../services/ventaService";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

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
  const [reservasPendientes, setReservasPendientes] = useState<
    ReservaConPasajeros[]
  >([]);
  const [reservasConfirmadas, setReservasConfirmadas] = useState<
    ReservaConPasajeros[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isLoading, logout, userInfo } = useAuth();

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const data = await listarReservasYPasajerosPorViaje(Number(id));

        const reservasConVenta = await Promise.all(
          data.map(async (reserva: ReservaConPasajeros) => {
            const tieneVenta = await existeReservaVenta(reserva.reservaId);
            return { ...reserva, tieneVenta };
          })
        );

        setReservasPendientes(reservasConVenta.filter((r) => !r.tieneVenta));
        setReservasConfirmadas(reservasConVenta.filter((r) => r.tieneVenta));
      } catch (err: any) {
        setError(err?.response?.data?.error || "Error al obtener reservas");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [id]);

  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioChofer") {
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
  const formatDate = (fechaISO: string) => {
    const [year, month, day] = fechaISO.split("T")[0].split("-").map(Number);
    return ` ${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  };

  const handleEliminar = (idPasajero: number, reservaId: number) => {
    const reserva = reservasPendientes.find((r) => r.reservaId === reservaId);

    const cantidadPasajeros = reserva?.pasajeros.length ?? 0;

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
        // await eliminarReserva(idReserva);

        // Redirige a otra pantalla
        router.replace("/(tabs)/choferReserva");
        return;
      }
      router.push({
        pathname: "/pantallas/confirmarReserva",
        params: {
          id: id,
          origen: origen,
          destino: destino,
          fecha: fecha,
          hora: hora,
        },
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

  const renderReserva = (item: ReservaConPasajeros) => {
    console.log("ver si viene id usuario ", item.usuarios_id);
    const mostrarColumna = !item.tieneVenta;

    return (
      <View key={item.reservaId} style={styles.card}>
        <Text style={styles.label}>
          Fecha Reserva: {formatDate(item.fechaReserva)} | {origen} ➜ {destino}{" "}
          | {fecha} - {hora}hs
        </Text>

        {Platform.OS === "web" ? (
          <View style={stylesweb.webTablaContenedor}>
            {/* Encabezado */}
            <View style={stylesweb.tablaEncabezado}>
              <View style={stylesweb.tablaCelda}>
                <Text style={stylesweb.celdaHeader}>Nombre</Text>
              </View>
              <View style={stylesweb.tablaCelda}>
                <Text style={stylesweb.celdaHeader}>Apellido</Text>
              </View>
              <View style={stylesweb.tablaCelda}>
                <Text style={stylesweb.celdaHeader}>DNI</Text>
              </View>
              <View style={stylesweb.tablaCelda}>
                <Text style={stylesweb.celdaHeader}>Ubi. Origen</Text>
              </View>
              <View style={stylesweb.tablaCelda}>
                <Text style={stylesweb.celdaHeader}>Ubi. Destino</Text>
              </View>

              {mostrarColumna && (
                <View style={stylesweb.iconoCelda}>
                  <Text style={stylesweb.celdaHeader}>Eliminar</Text>
                </View>
              )}
            </View>

            {/* Filas */}
            {item.pasajeros.map((p) => (
              <View key={p.id} style={stylesweb.tablaFila}>
                <View style={stylesweb.tablaCelda}>
                  <Text>{p.nombre}</Text>
                </View>
                <View style={stylesweb.tablaCelda}>
                  <Text>{p.apellido}</Text>
                </View>
                <View style={stylesweb.tablaCelda}>
                  <Text>{p.dni}</Text>
                </View>
                <View style={stylesweb.tablaCelda}>
                  <Text>{p.ubicacionOrigen}</Text>
                </View>
                <View style={stylesweb.tablaCelda}>
                  <Text>{p.ubicacionDestino}</Text>
                </View>

                {mostrarColumna && (
                  <View style={stylesweb.iconoCelda}>
                    {!item.tieneVenta && (
                      <Pressable
                        onPress={() => handleEliminar(p.id, item.reservaId)}
                      >
                        <Ionicons
                          name="trash-bin-outline"
                          size={24}
                          style={stylesweb.iconoEliminar}
                        />
                      </Pressable>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={true}>
            <View>
              {/* Encabezado */}
              <View style={styles.tablaEncabezado}>
                <View style={styles.celda}>
                  <Text style={styles.celdaHeader}>Nombre</Text>
                </View>
                <View style={styles.celda}>
                  <Text style={styles.celdaHeader}>Apellido</Text>
                </View>
                <View style={styles.celda}>
                  <Text style={styles.celdaHeader}>DNI</Text>
                </View>
                <View style={styles.celda}>
                  <Text style={styles.celdaHeader}>Origen</Text>
                </View>
                <View style={styles.celda}>
                  <Text style={styles.celdaHeader}>Destino</Text>
                </View>
                {mostrarColumna && (
                  <View style={styles.celdaAccion}>
                    <Text style={styles.celdaHeader}>Eliminar</Text>
                  </View>
                )}
              </View>

              {/* Filas */}
              {item.pasajeros.map((p) => (
                <View key={p.id} style={styles.tablaFila}>
                  <View style={styles.celda}>
                    <Text>{p.nombre}</Text>
                  </View>
                  <View style={styles.celda}>
                    <Text>{p.apellido}</Text>
                  </View>
                  <View style={styles.celda}>
                    <Text>{p.dni}</Text>
                  </View>
                  <View style={styles.celda}>
                    <Text>{p.ubicacionOrigen}</Text>
                  </View>
                  <View style={styles.celda}>
                    <Text>{p.ubicacionDestino}</Text>
                  </View>
                  {mostrarColumna && (
                    <View style={styles.celdaAccion}>
                      {!item.tieneVenta && (
                        <Pressable
                          onPress={() => handleEliminar(p.id, item.reservaId)}
                        >
                          <Ionicons
                            name="trash-bin-outline"
                            size={24}
                            style={stylesweb.iconoEliminar}
                          />
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {!item.tieneVenta && (
          <View style={styles.buttonContainer}>
            <Pressable
              style={styles.botonConfirmar}
              onPress={() =>
                router.push({
                  pathname: "/pantallas/ventaReserva",
                  params: { id: item.reservaId },
                })
              }
            >
              <Text style={styles.botonTexto}>Confirmar</Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <ScrollView style={styles.container}>
      {reservasPendientes.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Reservas pendientes de confirmación
          </Text>
          {reservasPendientes.map(renderReserva)}
        </>
      )}

      {reservasConfirmadas.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Reservas confirmadas</Text>
          {reservasConfirmadas.map(renderReserva)}
        </>
      )}

      {reservasPendientes.length === 0 && reservasConfirmadas.length === 0 && (
        <Text style={styles.error}>
          No hay reservas registradas para este viaje.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tablaEncabezado: {
    flexDirection: "row",
    color: "#4c68d7",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },

  tablaFila: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },

  celda: {
    width: 120, // ancho fijo para alineación garantizada
    padding: 6,
    justifyContent: "center",
  },

  celdaAccion: {
    width: 60,
    alignItems: "center",
    justifyContent: "center",
  },

  celdaHeader: {
    fontWeight: "bold",
    color: "#4c68d7",
  },

  iconoEliminar: {
    width: 20,
    height: 20,
    tintColor: "#E53935",
    color: "#b90606",
  },

  tablaCelda: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },

  iconoCelda: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },

  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f2" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 6,
    borderLeftColor: "#4c68d7",
  },
  reservaId: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  subTitle: {
    marginTop: 8,
    fontWeight: "600",
  },
  pasajeroBox: {
    marginTop: 6,
    backgroundColor: "#eef1f6",
    padding: 10,
    borderRadius: 8,
  },
  pasajeroNombre: {
    fontWeight: "bold",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
    fontSize: 16,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
  botonConfirmar: {
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
    elevation: 4,
  },

  webScrollWrapper: {
    alignItems: "center",
    width: "100%",
    overflowX: "auto",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },

  label: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
});

const stylesweb = StyleSheet.create({
  webTablaContenedor: {
    marginTop: 10,
    width: "100%",
  },

  tablaEncabezado: {
    flexDirection: "row",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },

  tablaFila: {
    flexDirection: "row",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
  },

  tablaCelda: {
    flex: 1,
    paddingHorizontal: 8,
    justifyContent: "center",
  },

  celdaHeader: {
    fontWeight: "bold",
    color: "#333",
    textAlign: "left",
  },

  iconoCelda: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },

  iconoEliminar: {
    width: 20,
    height: 20,
    tintColor: "#E53935",
    cursor: "pointer",
    color: "#b90606",
  },
});
