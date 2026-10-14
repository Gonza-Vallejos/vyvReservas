import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Redirect, useLocalSearchParams } from "expo-router";
import { obtenerViajesMasReservadosPorEmpresa } from "../../../services/reportesService";
import { useAuth } from "../../../context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { formatDate, formatTime } from "@/utils/dateFormatter";

interface ViajeMasReservado {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  fechaViaje: string;
  horarioSalida: string;
  cantidadReservas: number;
}

interface RespuestaViajesMasReservados {
  viajes: ViajeMasReservado[];
  totalReservas: number;
}

export default function ViajesMasReservadosScreen() {
  const { id } = useLocalSearchParams();
  const { userInfo } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
  const [showPickerDesde, setShowPickerDesde] = useState(false);
  const [showPickerHasta, setShowPickerHasta] = useState(false);

  if (userInfo?.perfil !== "usuarioEmpresa") {
    return <Redirect href="/(tabs)" />;
  }

  const fetchData = useCallback(
    () => obtenerViajesMasReservadosPorEmpresa(userInfo?.empresa_id),
    [userInfo?.empresa_id]
  );

  const { data, loading, error, refetch } = useAsyncData<RespuestaViajesMasReservados>({
    fetchFn: fetchData,
    dependencies: [userInfo?.empresa_id],
  });

  const hayFiltrosActivos =
    busqueda !== "" || fechaDesde !== null || fechaHasta !== null;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaDesde(null);
    setFechaHasta(null);
  };

  const viajesFiltrados = useMemo(() => {
    if (!data) return [];
    const texto = busqueda.toLowerCase();

    return data.viajes.filter((viaje) => {
      const coincideTexto =
        viaje.origenLocalidad.toLowerCase().includes(texto) ||
        viaje.destinoLocalidad.toLowerCase().includes(texto) ||
        formatDate(viaje.fechaViaje).toLowerCase().includes(texto);

      if (!coincideTexto) return false;

      const fechaViajeDate = new Date(viaje.fechaViaje);
      const dentroRangoDesde = fechaDesde ? fechaViajeDate >= fechaDesde : true;
      const dentroRangoHasta = fechaHasta ? fechaViajeDate <= fechaHasta : true;

      return dentroRangoDesde && dentroRangoHasta;
    });
  }, [data, busqueda, fechaDesde, fechaHasta]);

  return (
    <ScreenContainer
      loading={loading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
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
      <Text style={styles.subtitle}>
        Total de viajes: {data?.totalReservas ?? 0}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por origen, destino o fecha"
        placeholderTextColor="#888"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <View style={styles.fechaRow}>
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
        viajesFiltrados.map((item) => (
          <Card key={item.id} style={styles.card}>
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
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    color: "#555",
  },
  card: {
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
  },
  empty: {
    color: "gray",
    marginTop: 20,
    fontSize: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  limpiarFiltrosButton: {
    backgroundColor: "#999",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginBottom: 8,
  },
  limpiarFiltrosText: {
    color: "#fff",
    fontWeight: "bold",
  },
  filaBotones: {
    flexDirection: "row-reverse",
  },
  fechaButton: {
    backgroundColor: "#4c68d7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
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
  fechaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
});
