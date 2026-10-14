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
import { obtenerViajesPorTransporteDeEmpresa } from "../../../services/reportesService";
import { Redirect } from "expo-router";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { formatDate, formatTime } from "@/utils/dateFormatter";

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
    () => obtenerViajesPorTransporteDeEmpresa(userInfo?.empresa_id),
    [userInfo?.empresa_id]
  );

  const { data = [], loading, error, refetch } = useAsyncData<TransporteConViajes[]>({
    fetchFn: fetchData,
    dependencies: [userInfo?.empresa_id],
  });

  const hayFiltros = busqueda !== "" || fechaDesde || fechaHasta;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaDesde(null);
    setFechaHasta(null);
  };

  const datosFiltrados = useMemo(() => {
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
  }, [data, busqueda, fechaDesde, fechaHasta]);

  const viajesColumns: DataTableColumn<Viaje>[] = [
    { key: "origen", label: "Origen", width: 130 },
    { key: "destino", label: "Destino", width: 130 },
    { key: "fechaViaje", label: "Fecha", width: 100, render: (item) => formatDate(item.fechaViaje) },
    { key: "horarioSalida", label: "Hora", width: 80, render: (item) => formatTime(item.horarioSalida) },
  ];

  return (
    <ScreenContainer
      loading={loading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      scrollEnabled
      contentContainerStyle={styles.container}
    >
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
        <Text style={styles.empty}>No se encontraron resultados</Text>
      ) : (
        datosFiltrados.map((transporte) => (
          <Card key={transporte.transporteId} style={styles.transporteCard}>
            <Text style={styles.subTitle}>
              🚍 {transporte.nombre} ({transporte.patente})
            </Text>
            <Text>Marca: {transporte.marca}</Text>
            <Text style={{ marginBottom: 10 }}>
              Total de viajes: {transporte.cantidadViajes}
            </Text>

            <DataTable
              columns={viajesColumns}
              data={transporte.viajes}
              keyExtractor={(item) => item.id.toString()}
              emptyMessage="No hay viajes para este transporte."
            />
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
    marginBottom: 16,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 6,
  },
  transporteCard: {
    marginBottom: 20,
  },
  empty: {
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
  fechaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
});
