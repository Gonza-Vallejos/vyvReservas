import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../../context/AuthContext";
import { obtenerViajesPorTransporteDeEmpresa } from "../../../services/reportesService";
import { Redirect } from "expo-router";

interface Viaje {
  id: number;
  fechaViaje: string;
  horarioSalida: string;
  origen: string;
  destino: string;
}

interface TransporteConViajes {
  transporteId: number;
  nombre: string;
  patente: string;
  marca: string;
  cantidadViajes: number;
  viajes: Viaje[];
}

export default function ViajesPorTransporteScreen() {
  const { logout, userInfo } = useAuth();
  const [data, setData] = useState<TransporteConViajes[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
  const [showDesde, setShowDesde] = useState(false);
  const [showHasta, setShowHasta] = useState(false);

  if (userInfo?.perfil !== "usuarioEmpresa") {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const respuesta = await obtenerViajesPorTransporteDeEmpresa(
          userInfo.empresa_id
        );
        setData(respuesta);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Error al obtener los viajes");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const formatDate = (fechaISO: string) => {
    const [year, month, day] = fechaISO.split("T")[0].split("-").map(Number);
    return `${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const hayFiltros = busqueda !== "" || fechaDesde || fechaHasta;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaDesde(null);
    setFechaHasta(null);
  };

  const filtrarDatos = () => {
    const texto = busqueda.toLowerCase();

    return data
      .map((t) => {
        const viajesFiltrados = t.viajes.filter((viaje) => {
          const coincideTexto =
            t.nombre.toLowerCase().includes(texto) ||
            t.patente.toLowerCase().includes(texto) ||
            viaje.origen.toLowerCase().includes(texto) ||
            viaje.destino.toLowerCase().includes(texto);

          if (!coincideTexto) return false;

          const fechaViaje = new Date(viaje.fechaViaje);
          const desdeOK = fechaDesde ? fechaViaje >= fechaDesde : true;
          const hastaOK = fechaHasta ? fechaViaje <= fechaHasta : true;

          return desdeOK && hastaOK;
        });

        return {
          ...t,
          viajes: viajesFiltrados,
          cantidadViajes: viajesFiltrados.length,
        };
      })
      .filter((t) => t.viajes.length > 0);
  };

  const datosFiltrados = filtrarDatos();

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Viajes por Transporte</Text>

      {hayFiltros && (
        <TouchableOpacity style={styles.botonLimpiar} onPress={limpiarFiltros}>
          <Text style={styles.limpiarTexto}>Limpiar filtros</Text>
        </TouchableOpacity>
      )}

      <TextInput
        style={styles.input}
        placeholder="Buscar transporte, patente, origen o destino"
        placeholderTextColor="#888"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <View style={{ flex: 1, marginRight: 8 }}>
          {Platform.OS === "web" ? (
            <>
              <Text style={styles.fechaLabel}>Fecha Desde:</Text>
              <input
                type="date"
                value={fechaDesde ? fechaDesde.toISOString().split("T")[0] : ""}
                onChange={(e) => setFechaDesde(new Date(e.target.value))}
                style={styles.dateInputWeb}
              />
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.fechaButton}
                onPress={() => setShowDesde(true)}
              >
                <Text style={styles.fechaButtonText}>
                  {fechaDesde
                    ? formatDate(fechaDesde.toISOString())
                    : "Fecha Desde"}
                </Text>
              </TouchableOpacity>
              {showDesde && (
                <DateTimePicker
                  value={fechaDesde || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_e, selectedDate) => {
                    setShowDesde(false);
                    if (selectedDate) setFechaDesde(selectedDate);
                  }}
                />
              )}
            </>
          )}
        </View>

        <View style={{ flex: 1, marginLeft: 8 }}>
          {Platform.OS === "web" ? (
            <>
              <Text style={styles.fechaLabel}>Fecha Hasta:</Text>
              <input
                type="date"
                value={fechaHasta ? fechaHasta.toISOString().split("T")[0] : ""}
                onChange={(e) => setFechaHasta(new Date(e.target.value))}
                style={styles.dateInputWeb}
              />
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.fechaButton}
                onPress={() => setShowHasta(true)}
              >
                <Text style={styles.fechaButtonText}>
                  {fechaHasta
                    ? formatDate(fechaHasta.toISOString())
                    : "Fecha Hasta"}
                </Text>
              </TouchableOpacity>
              {showHasta && (
                <DateTimePicker
                  value={fechaHasta || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_e, selectedDate) => {
                    setShowHasta(false);
                    if (selectedDate) setFechaHasta(selectedDate);
                  }}
                />
              )}
            </>
          )}
        </View>
      </View>

      {datosFiltrados.length === 0 ? (
        <Text style={styles.error}>No se encontraron resultados</Text>
      ) : (
        datosFiltrados.map((transporte) => (
          <View key={transporte.transporteId} style={styles.transporteCard}>
            <Text style={styles.subTitle}>
              🚍 {transporte.nombre} ({transporte.patente})
            </Text>
            <Text>Marca: {transporte.marca}</Text>
            <Text>Total de viajes: {transporte.cantidadViajes}</Text>

            {transporte.viajes.map((viaje) => (
              <View key={viaje.id} style={styles.viajeCard}>
                <Text>🧭 Origen: {viaje.origen}</Text>
                <Text>🏁 Destino: {viaje.destino}</Text>
                <Text>📅 Fecha: {formatDate(viaje.fechaViaje)}</Text>
                <Text>🕒 Hora: {formatTime(viaje.horarioSalida)}</Text>
              </View>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f4f4f4",
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  transporteCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    elevation: 2,
  },
  viajeCard: {
    backgroundColor: "#e9ecef",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  error: {
    color: "gray",
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderColor: "#ccc",
    borderWidth: 1,
  },
  fechaButton: {
    backgroundColor: "#4c68d7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  fechaButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  fechaLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },
  dateInputWeb: {
    width: "100%",
    padding: 8,
    fontSize: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  botonLimpiar: {
    alignSelf: "flex-end",
    backgroundColor: "#999",
    padding: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  limpiarTexto: {
    color: "#fff",
    fontWeight: "bold",
  },
});
