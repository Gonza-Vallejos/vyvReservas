import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ScrollView,
  Platform,
  Pressable,
  Image,
  ActivityIndicator,
} from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { listarPasajeroPorViaje } from "../../services/reservaService"; // Asegúrate de tener esta función en tu servicio
import {
  listarReservasYPasajerosPorViaje,
  eliminarPasajero,
} from "../../services/reservaService";
import { existeVentaPorPasajero } from "../../services/ventaService";
import { useAuth } from "../../context/AuthContext";

interface Pasajero {
  id: number;
  nombre: string;
  apellido: string;
  dni: number;
  ubicacionOrigen: string;
  ubicacionDestino: string;
  tieneVenta?: boolean;
}

export default function ChoferListaPasajeros() {
  const { id, origen, destino } = useLocalSearchParams();
  const router = useRouter();
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([]);
  const { isLoading, logout, userInfo } = useAuth();

  useEffect(() => {
    const fetchPasajeros = async () => {
      try {
        const data = await listarPasajeroPorViaje(Number(id));
        // Verificar venta para cada pasajero
        const pasajerosConVenta = await Promise.all(
          data.map(async (p: Pasajero) => {
            const tieneVenta = await existeVentaPorPasajero(p.id);
            return { ...p, tieneVenta };
          })
        );

        setPasajeros(pasajerosConVenta);
      } catch (error) {
        console.error("Error al obtener pasajeros:", error);
      }
    };

    if (id) {
      fetchPasajeros();
    }
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
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>
        {" "}
        {origen} ➜ {destino}
      </Text>

      {pasajeros.length === 0 ? (
        <Text style={styles.emptyMessage}>No hay pasajeros en este viaje.</Text>
      ) : Platform.OS === "web" ? (
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
            <View style={stylesweb.iconoCelda}>
              <Text style={stylesweb.celdaHeader}>Confirmado</Text>
            </View>
          </View>
          {/* Filas */}
          {pasajeros.map((item) => (
            <View key={item.id} style={stylesweb.tablaFila}>
              <View style={stylesweb.tablaCelda}>
                <Text>{item.nombre}</Text>
              </View>
              <View style={stylesweb.tablaCelda}>
                <Text>{item.apellido}</Text>
              </View>
              <View style={stylesweb.tablaCelda}>
                <Text>{item.dni}</Text>
              </View>
              <View style={stylesweb.tablaCelda}>
                <Text>{item.ubicacionOrigen}</Text>
              </View>
              <View style={stylesweb.tablaCelda}>
                <Text>{item.ubicacionDestino}</Text>
              </View>
              <View style={stylesweb.iconoCelda}>
                <Image
                  source={
                    item.tieneVenta
                      ? require("../../assets/images/icons8-asiento-50.png") // ✅ venta confirmada
                      : require("../../assets/images/icons8-car-seat-50.png") // ❌ sin venta
                  }
                  style={stylesweb.iconoEstado}
                />
              </View>
            </View>
          ))}
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View>
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
              <View style={stylesweb.iconoCelda}>
                <Text style={stylesweb.celdaHeader}>Confirmado</Text>
              </View>
            </View>

            {pasajeros.map((item) => (
              <View key={item.id} style={styles.tablaFila}>
                <View style={styles.celda}>
                  <Text>{item.nombre}</Text>
                </View>
                <View style={styles.celda}>
                  <Text>{item.apellido}</Text>
                </View>
                <View style={styles.celda}>
                  <Text>{item.dni}</Text>
                </View>
                <View style={styles.celda}>
                  <Text>{item.ubicacionOrigen}</Text>
                </View>
                <View style={styles.celda}>
                  <Text>{item.ubicacionDestino}</Text>
                </View>
                <View style={stylesweb.iconoCelda}>
                  <Image
                    source={
                      item.tieneVenta
                        ? require("../../assets/images/icons8-asiento-50.png") // ✅ venta confirmada
                        : require("../../assets/images/icons8-car-seat-50.png") // ❌ sin venta
                    }
                    style={styles.iconoEstado}
                  />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f2" },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "left",
    marginBottom: 16,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#333",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  reservaId: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
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
  tablaEncabezado: {
    flexDirection: "row",
    marginTop: 8,
    borderBottomWidth: 1,
    paddingBottom: 4,
    borderBottomColor: "#ccc",
    backgroundColor: "#eee",
  },
  tablaFila: {
    flexDirection: "row",
    paddingVertical: 1,
    borderColor: "#eee",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    alignItems: "center",
  },
  tablaCelda: {
    minWidth: 100,

    fontSize: 13,
    paddingRight: 12,
    color: "#333",
  },

  celdaHeader: {
    fontWeight: "bold",
    color: "#4c68d7",
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
  emptyMessage: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
  webTablaContenedor: {
    width: "100%",
    flexDirection: "column",
    marginBottom: 20,
  },

  celda: {
    width: 120, // ancho fijo para alineación garantizada
    padding: 6,
    justifyContent: "center",
  },
  iconoEstado: {
    width: 24,
    height: 24,
    alignSelf: "center",
  },
});

const stylesweb = StyleSheet.create({
  webTablaContenedor: {
    width: "100%",
    flexDirection: "column",
  },

  tablaEncabezado: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 6,
    marginBottom: 4,
    backgroundColor: "#f5f5f5",
  },

  tablaFila: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },

  tablaCelda: {
    flex: 1,
    fontSize: 13,
    paddingRight: 10,
    color: "#333",
  },

  celdaHeader: {
    fontWeight: "bold",
    color: "#4c68d7",
  },
  iconoEstado: {
    width: 24,
    height: 24,
    alignSelf: "center",
  },

  iconoCelda: {
    flex: 0.5,
    alignItems: "center",
    justifyContent: "center",
  },
});
