import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Redirect, useLocalSearchParams } from "expo-router";
import { obtenerViajesMasReservadosPorEmpresa } from "../../../services/reportesService";
import { useAuth } from "../../../context/AuthContext";

interface ViajeMasReservado {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  fechaViaje: string;
  horarioSalida: string;
  cantidadReservas: number;
}

export default function ViajesMasReservadosScreen() {
  const { id } = useLocalSearchParams();
  const [viajes, setViajes] = useState<ViajeMasReservado[]>([]);
  const [totalViajes, setTotalReservas] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { logout, userInfo } = useAuth();

  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
  const [showPickerDesde, setShowPickerDesde] = useState(false);
  const [showPickerHasta, setShowPickerHasta] = useState(false);

  if (userInfo?.perfil !== "usuarioEmpresa") {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const cargarViajes = async () => {
      try {
        const respuesta = await obtenerViajesMasReservadosPorEmpresa(
          userInfo?.empresa_id
        );
        setViajes(respuesta.viajes);
        setTotalReservas(respuesta.totalReservas);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            "Error al obtener los viajes más reservados"
        );
      } finally {
        setLoading(false);
      }
    };

    cargarViajes();
  }, [userInfo?.empresa_id]);

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

  const hayFiltrosActivos =
    busqueda !== "" || fechaDesde !== null || fechaHasta !== null;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaDesde(null);
    setFechaHasta(null);
  };

  const viajesFiltrados = viajes.filter((viaje) => {
    const texto = busqueda.toLowerCase();

    const coincideTexto =
      viaje.origenLocalidad.toLowerCase().includes(texto) ||
      viaje.destinoLocalidad.toLowerCase().includes(texto) ||
      formatDate(viaje.fechaViaje).includes(texto);

    if (!coincideTexto) return false;

    const fechaViajeDate = new Date(viaje.fechaViaje);
    const dentroRangoDesde = fechaDesde ? fechaViajeDate >= fechaDesde : true;
    const dentroRangoHasta = fechaHasta ? fechaViajeDate <= fechaHasta : true;

    return dentroRangoDesde && dentroRangoHasta;
  });

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={styles.container}>
      <View style={styles.filaBotones}>
        {hayFiltrosActivos && (
          <TouchableOpacity
            onPress={limpiarFiltros}
            style={styles.limpiarFiltrosButton}
          >
            <Text style={styles.limpiarFiltrosText}>Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.title}>Viajes más Reservados</Text>
      <Text style={styles.subtitle}>Total de viajes: {totalViajes}</Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por origen, destino o fecha"
        placeholderTextColor="#888"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        {/* Fecha Desde */}
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
                onPress={() => setShowPickerDesde(true)}
              >
                <Text style={styles.fechaButtonText}>
                  {fechaDesde
                    ? formatDate(fechaDesde.toISOString())
                    : "Fecha desde"}
                </Text>
              </TouchableOpacity>
              {showPickerDesde && (
                <DateTimePicker
                  value={fechaDesde || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_event, selectedDate) => {
                    setShowPickerDesde(false);
                    if (selectedDate) setFechaDesde(selectedDate);
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* Fecha Hasta */}
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
                onPress={() => setShowPickerHasta(true)}
              >
                <Text style={styles.fechaButtonText}>
                  {fechaHasta
                    ? formatDate(fechaHasta.toISOString())
                    : "Fecha hasta"}
                </Text>
              </TouchableOpacity>
              {showPickerHasta && (
                <DateTimePicker
                  value={fechaHasta || new Date()}
                  mode="date"
                  display="default"
                  onChange={(_event, selectedDate) => {
                    setShowPickerHasta(false);
                    if (selectedDate) setFechaHasta(selectedDate);
                  }}
                />
              )}
            </>
          )}
        </View>
      </View>

      {viajesFiltrados.length === 0 ? (
        <Text style={styles.empty}>
          No hay resultados que coincidan con los filtros.
        </Text>
      ) : (
        <FlatList
          data={viajesFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text>
                <Text style={styles.label}>Origen:</Text> {item.origenLocalidad}
              </Text>
              <Text>
                <Text style={styles.label}>Destino:</Text>{" "}
                {item.destinoLocalidad}
              </Text>
              <Text>
                <Text style={styles.label}>Fecha:</Text>{" "}
                {formatDate(item.fechaViaje)}
              </Text>
              <Text>
                <Text style={styles.label}>Hora de salida:</Text>{" "}
                {formatTime(item.horarioSalida)}
              </Text>
              <Text>
                <Text style={styles.label}>Reservas:</Text>{" "}
                {item.cantidadReservas}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f2f2f2" },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
    color: "#555",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 2,
  },
  label: { fontWeight: "bold" },
  error: { color: "red", marginTop: 20, textAlign: "center", fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  empty: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 20 },
  fechaButton: {
    backgroundColor: "#4c68d7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 8,
  },
  fechaButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.3,
  },
  fechaLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#333",
  },

  limpiarFiltrosButton: {
    backgroundColor: "#b2babb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  limpiarFiltrosText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  filaBotones: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 12,
  },
  dateInputWeb: {
    width: "100%",
    padding: 8,
    fontSize: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#fff",
    boxSizing: "border-box",
  },
});
