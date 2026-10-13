import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Animated,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import {
  obtenerReservas,
  eliminarReserva,
} from "../../services/reservaService";
import { useAuth } from "../../context/AuthContext";
import { Redirect, router } from "expo-router";
import { existeReservaVenta } from "../../services/ventaService";

interface Viaje {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  horarioSalida: string;
  fechaViaje: string;
  precio: number;
  usuarioEmpresa_id: number;
  medioTransporte_id: number;
}

interface Reserva {
  id: number;
  fechaReserva: string;
  viaje: Viaje;
  tieneVenta?: boolean;
}

const MisReservas = () => {
  const [reservasPendientes, setReservasPendientes] = useState<Reserva[]>([]);
  const [reservasPagadas, setReservasPagadas] = useState<Reserva[]>([]);
  const [reservasPasadas, setReservasPasadas] = useState<Reserva[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const { logout, userInfo } = useAuth();

  if (userInfo?.perfil !== "usuarioCliente") {
    return <Redirect href="/(tabs)" />;
  }
  useEffect(() => {
    const fetchReservas = async () => {
      if (!userInfo?.id) {
        setError("No se pudo obtener el ID del usuario");
        setLoading(false);
        return;
      }

      try {
        const reservasData = await obtenerReservas(userInfo.id);

        const reservasConVenta = await Promise.all(
          reservasData.map(async (reserva: Reserva) => {
            const tieneVenta = await existeReservaVenta(reserva.id);
            return { ...reserva, tieneVenta };
          })
        );

        const now = new Date();

        const getFechaHoraViaje = (fecha: string, hora: string): Date => {
          const [year, month, day] = fecha.split("T")[0].split("-").map(Number);
          const [hours, minutes] = hora.split(":").map(Number);
          return new Date(year, month - 1, day, hours, minutes);
        };

        //para guardar las reservas por viajar y las que ya viajaron
        const futuras: Reserva[] = [];
        const pasadas: Reserva[] = [];

        reservasConVenta.forEach((r) => {
          const fechaHoraViaje = getFechaHoraViaje(
            r.viaje.fechaViaje,
            r.viaje.horarioSalida
          );
          if (fechaHoraViaje.getTime() > now.getTime()) {
            futuras.push(r);
          } else {
            pasadas.push(r);
          }
        });

        // solo las futuras controla si tiene o no venta
        setReservasPendientes(futuras.filter((r) => !r.tieneVenta));
        setReservasPagadas(futuras.filter((r) => r.tieneVenta));
        setReservasPasadas(pasadas);
      } catch (error) {
        setError("Hubo un problema al obtener las reservas");
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, []);

  const toggleExpand = (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      Animated.timing(animation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    } else {
      setExpandedId(id);
      Animated.timing(animation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleEliminarReserva = async (id: number) => {
    let confirmacion = false;
    //el alerta del eliminar reserva para web y movil
    if (Platform.OS === "web") {
      confirmacion = window.confirm(
        "¿Estás seguro que deseas eliminar esta reserva?"
      );
    } else {
      confirmacion = await new Promise<boolean>((resolve) => {
        Alert.alert(
          "Confirmar eliminación",
          "¿Estás seguro que deseas eliminar esta reserva?",
          [
            {
              text: "Cancelar",
              style: "cancel",
              onPress: () => resolve(false),
            },
            {
              text: "Eliminar",
              style: "destructive",
              onPress: () => resolve(true),
            },
          ],
          { cancelable: true }
        );
      });
    }

    if (!confirmacion) return;

    try {
      await eliminarReserva(Number(id));
      setReservasPendientes((prev) =>
        prev.filter((reserva) => reserva.id !== id)
      );
      if (Platform.OS === "web") {
        alert("Reserva eliminada con éxito");
      } else {
        Alert.alert("Reserva eliminada con éxito");
      }
    } catch (error) {
      if (Platform.OS === "web") {
        alert("No se pudo eliminar la reserva");
      } else {
        Alert.alert("Error", "No se pudo eliminar la reserva");
      }
    }
  };

  const formatDate = (fechaISO: string) => {
    const [year, month, day] = fechaISO.split("T")[0].split("-").map(Number);
    return ` ${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return ` ${hours}:${minutes}`;
  };

  const renderReserva = (item: Reserva, esPasada: boolean = false) => {
    //si es pasada y no  viajo o no se conformo va a mostrar el mensaje despues
    const noViajaste = esPasada && !item.tieneVenta;

    return (
      <View
        key={item.id}
        style={[styles.card, esPasada && { backgroundColor: "#e0e0e0" }]}
      >
        <Text style={styles.viajeRuta}>
          {item.viaje.origenLocalidad} ➜ {item.viaje.destinoLocalidad}
        </Text>

        <View style={styles.fila}>
          <Text style={styles.filaTexto}>
            🗓 {formatDate(item.viaje.fechaViaje)}
          </Text>
          <Text style={styles.filaTexto}>
            🕓 {formatTime(item.viaje.horarioSalida)} hs
          </Text>
        </View>

        <View style={styles.filaBottom}>
          <Text style={styles.precio}>
            ARS $
            {item.viaje.precio.toLocaleString("es-AR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>

          <Pressable
            style={styles.btnSeleccionar}
            onPress={() => toggleExpand(item.id)}
          >
            <Text style={styles.btnSeleccionarText}>Ver más</Text>
          </Pressable>
        </View>

        {expandedId === item.id && (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.detail}>Reserva #{item.id}</Text>
            <Text style={styles.detail}>
              Fecha de Reserva: {formatDate(item.fechaReserva)}
            </Text>

            {noViajaste ? (
              <Text
                style={[
                  styles.detail,
                  { color: "red", marginTop: 8, fontWeight: "bold" },
                ]}
              >
                Sin Confirmación !!
              </Text>
            ) : (
              <View style={styles.botonesContainer}>
                <Pressable
                  style={styles.botonDetalle}
                  onPress={() =>
                    router.push({
                      pathname: "/pantallas/detalleReserva",
                      params: {
                        id: item.viaje.id,
                        tieneVenta: item.tieneVenta?.toString(),
                        idReserva: item.id,
                      },
                    })
                  }
                >
                  <Text style={styles.btnSeleccionarText}>Ver Detalle</Text>
                </Pressable>

                {item.tieneVenta ? (
                  <Pressable
                    style={styles.botonDetalle}
                    onPress={() =>
                      router.push({
                        pathname: "/pantallas/detalleVenta",
                        params: { id: item.id },
                      })
                    }
                  >
                    <Text style={styles.btnSeleccionarText}>Ver Compra</Text>
                  </Pressable>
                ) : (
                  // Si no tiene venta (reserva pendiente), muestro botón eliminar
                  <TouchableOpacity
                    style={styles.botonEliminar}
                    onPress={() => handleEliminarReserva(item.id)}
                  >
                    <Text style={styles.btnSeleccionarText}>Eliminar</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      {reservasPendientes.length === 0 &&
      reservasPagadas.length === 0 &&
      reservasPasadas.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20, color: "#888" }}>
          Aún no hay reservas
        </Text>
      ) : (
        <>
          {reservasPendientes.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>
                Reservas pendientes de confirmación
              </Text>
              {reservasPendientes.map((r) => renderReserva(r))}
            </>
          )}

          {reservasPagadas.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Reservas confirmadas</Text>
              {reservasPagadas.map((r) => renderReserva(r))}
            </>
          )}

          {reservasPasadas.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Viajes Finalizados</Text>
              {reservasPasadas.map((r) => renderReserva(r, true))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    backgroundColor: "#f2f2f2",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 14,
    textAlign: "left",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(56, 189, 248, 0.4)",
    paddingBottom: 6,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderLeftWidth: 5,
    borderLeftColor: "#38bdf8",
  },
  viajeRuta: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  filaTexto: {
    fontSize: 13,
    color: "#cbd5e1",
    fontWeight: "500",
  },
  filaBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    paddingTop: 10,
  },
  precio: {
    fontSize: 17,
    fontWeight: "700",
    color: "#38bdf8",
  },
  btnSeleccionar: {
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  btnSeleccionarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  detail: {
    fontSize: 13,
    marginTop: 4,
    color: "#94a3b8",
  },
  botonesContainer: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
    flexWrap: "wrap",
  },
  botonDetalle: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  botonEliminar: {
    backgroundColor: "#ef4444",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
  },
});

export default MisReservas;
