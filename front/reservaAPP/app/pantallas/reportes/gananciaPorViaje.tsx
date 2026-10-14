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
import { useAuth } from "../../../context/AuthContext";
import { obtenerGananciasPorViajePorEmpresa } from "../../../services/reportesService";
import { Redirect } from "expo-router";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { formatDate, formatTime, formatCurrency } from "@/utils/dateFormatter";

export interface MedioTransporte {
  id: number;
  nombre: string;
  patente: string;
  cantLugares: number;
  empresa_id: number;
}

export interface VentaResumen {
  id: number;
  totalVentas: number;
}

export interface ViajeResumen {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  fechaViaje: string;
  horarioSalida: string;
  precio: number;
  medioTransporte: MedioTransporte;
}

export interface ResultadoGananciaViaje {
  viaje: ViajeResumen;
  ventas: VentaResumen[];
  totalGanancia: number;
}

export default function GananciasPorViajeScreen() {
  const { userInfo } = useAuth();
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
  const [showDesde, setShowDesde] = useState(false);
  const [showHasta, setShowHasta] = useState(false);

  if (userInfo?.perfil !== "usuarioEmpresa") {
    return <Redirect href="/(tabs)" />;
  }

  const fetchData = useCallback(
    () => obtenerGananciasPorViajePorEmpresa(userInfo?.empresa_id),
    [userInfo?.empresa_id]
  );

  const { data, loading, error, refetch } = useAsyncData<{
    resultados: ResultadoGananciaViaje[];
  }>({
    fetchFn: fetchData,
    dependencies: [userInfo?.empresa_id],
  });

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaDesde(null);
    setFechaHasta(null);
  };

  const filtrarViajes = useMemo(() => {
    if (!data) return [];
    const texto = busqueda.toLowerCase();

    return data.resultados.filter((item) => {
      const fechaViaje = new Date(item.viaje.fechaViaje);

      const coincideTexto =
        item.viaje.origenLocalidad.toLowerCase().includes(texto) ||
        item.viaje.destinoLocalidad.toLowerCase().includes(texto) ||
        item.viaje.medioTransporte.nombre.toLowerCase().includes(texto) ||
        item.viaje.medioTransporte.patente.toLowerCase().includes(texto) ||
        formatDate(item.viaje.fechaViaje).toLowerCase().includes(texto);

      const dentroDesde = fechaDesde ? fechaViaje >= fechaDesde : true;
      const dentroHasta = fechaHasta ? fechaViaje <= fechaHasta : true;

      return coincideTexto && dentroDesde && dentroHasta;
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
      <Text style={styles.title}>Ganancias por Viaje</Text>

      <View style={styles.filtrosContainer}>
        <TextInput
          style={styles.input}
          placeholder="Buscar por origen, destino, patente..."
          placeholderTextColor="#888"
          value={busqueda}
          onChangeText={setBusqueda}
        />

        <View style={styles.fechaRow}>
          <View style={styles.fechaCol}>
            {Platform.OS === "web" ? (
              <>
                <Text style={styles.fechaLabel}>Desde:</Text>
                <input
                  type="date"
                  value={
                    fechaDesde ? fechaDesde.toISOString().split("T")[0] : ""
                  }
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
                      : "Fecha desde"}
                  </Text>
                </TouchableOpacity>
                {showDesde && (
                  <DateTimePicker
                    value={fechaDesde || new Date()}
                    mode="date"
                    display="default"
                    onChange={(_, selectedDate) => {
                      setShowDesde(false);
                      if (selectedDate) setFechaDesde(selectedDate);
                    }}
                  />
                )}
              </>
            )}
          </View>

          <View style={styles.fechaCol}>
            {Platform.OS === "web" ? (
              <>
                <Text style={styles.fechaLabel}>Hasta:</Text>
                <input
                  type="date"
                  value={
                    fechaHasta ? fechaHasta.toISOString().split("T")[0] : ""
                  }
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
                      : "Fecha hasta"}
                  </Text>
                </TouchableOpacity>
                {showHasta && (
                  <DateTimePicker
                    value={fechaHasta || new Date()}
                    mode="date"
                    display="default"
                    onChange={(_, selectedDate) => {
                      setShowHasta(false);
                      if (selectedDate) setFechaHasta(selectedDate);
                    }}
                  />
                )}
              </>
            )}
          </View>
        </View>

        {(busqueda || fechaDesde || fechaHasta) && (
          <TouchableOpacity
            onPress={limpiarFiltros}
            style={styles.limpiarFiltrosButton}
          >
            <Text style={styles.limpiarFiltrosText}>Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      {filtrarViajes.length === 0 ? (
        <Text style={styles.empty}>No hay resultados.</Text>
      ) : (
        filtrarViajes.map((item) => (
          <Card key={item.viaje.id} style={styles.card}>
            <Text style={styles.viajeTitulo}>
              {item.viaje.origenLocalidad} → {item.viaje.destinoLocalidad}
            </Text>
            <Text>Fecha: {formatDate(item.viaje.fechaViaje)}</Text>
            <Text>Hora: {formatTime(item.viaje.horarioSalida)}</Text>
            <Text>Precio: {formatCurrency(item.viaje.precio)}</Text>
            <Text>
              Transporte: {item.viaje.medioTransporte.nombre} (
              {item.viaje.medioTransporte.patente})
            </Text>
            <Text style={styles.totalGanancia}>
              Ganancia: {formatCurrency(item.totalGanancia)}
            </Text>

            <View style={styles.ventasBox}>
              <Text style={styles.label}>Ventas:</Text>
              {item.ventas.length === 0 ? (
                <Text style={styles.textoSecundario}>
                  No hay ventas registradas.
                </Text>
              ) : (
                item.ventas.map((venta) => (
                  <Text key={venta.id}>
                    Venta #{venta.id} - Pasajes: {venta.totalVentas}
                  </Text>
                ))
              )}
            </View>
          </Card>
        ))
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  viajeTitulo: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  ventasBox: { marginTop: 10 },
  totalGanancia: { marginTop: 10, fontWeight: "bold", fontSize: 16 },
  label: { fontWeight: "600", marginTop: 6 },
  textoSecundario: { fontStyle: "italic", color: "#555" },
  empty: { color: "gray", marginTop: 20, textAlign: "center", fontSize: 16 },
  filtrosContainer: { marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  limpiarFiltrosButton: {
    backgroundColor: "#999",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-end",
    marginTop: 10,
  },
  limpiarFiltrosText: { color: "#fff", fontWeight: "bold" },
  fechaRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  fechaCol: { flex: 1 },
  fechaButton: {
    backgroundColor: "#4c68d7",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  fechaButtonText: { color: "#fff", fontWeight: "bold" },
  fechaLabel: { fontWeight: "600", marginBottom: 4 },
  dateInputWeb: {
    width: "100%",
    padding: 8,
    fontSize: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
});
