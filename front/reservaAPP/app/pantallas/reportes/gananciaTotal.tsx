import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../../../context/AuthContext";
import { obtenerGananciaTotalPorEmpresa } from "../../../services/reportesService";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Redirect } from "expo-router";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import { formatDate, formatTime, formatCurrency } from "@/utils/dateFormatter";

export interface DetalleVenta {
  id: number;
  formaPago: string;
  subTotal: number;
  descuento: number;
  precioFinal: number;
}

export interface Venta {
  id: number;
  fecha: string;
  hora: string;
  totalVentas: number;
  DetalleVenta: DetalleVenta[];
}

export interface Reservas {
  id: number;
  usuarios_id: number;
  Ventas: Venta[];
}

export interface MedioTransporte {
  id: number;
  nombre: string;
  patente: string;
  cantLugares: number;
}

export interface ViajeConVentas {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  fechaViaje: string;
  horarioSalida: string;
  precio: number;
  MedioTransporte: MedioTransporte;
  Reservas: Reservas[];
}

export interface RespuestaGananciaTotal {
  totalGanancia: number;
  viajes: ViajeConVentas[];
}

export default function GananciaTotalScreen() {
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
    () => obtenerGananciaTotalPorEmpresa(userInfo?.empresa_id),
    [userInfo?.empresa_id]
  );

  const { data, loading, error, refetch } = useAsyncData<RespuestaGananciaTotal>({
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

    return data.viajes.filter((item) => {
      const fechaViaje = new Date(item.fechaViaje);

      const coincideTexto =
        item.origenLocalidad.toLowerCase().includes(texto) ||
        item.destinoLocalidad.toLowerCase().includes(texto) ||
        item.MedioTransporte.nombre.toLowerCase().includes(texto) ||
        item.MedioTransporte.patente.toLowerCase().includes(texto) ||
        formatDate(item.fechaViaje).toLowerCase().includes(texto);

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
      <Text style={styles.title}>
        Ganancia Total: {formatCurrency(data?.totalGanancia ?? 0)}
      </Text>

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
        <Text style={styles.empty}>No se encontraron resultados</Text>
      ) : (
        filtrarViajes.map((item) => (
          <Card key={item.id} style={styles.card}>
            <Text style={styles.viajeTitulo}>
              {item.origenLocalidad} → {item.destinoLocalidad}
            </Text>
            <Text style={styles.sub}>
              Fecha Viaje: {formatDate(item.fechaViaje)} - Salida:{" "}
              {formatTime(item.horarioSalida)}
            </Text>
            <Text style={styles.sub}>
              Transporte: {item.MedioTransporte.nombre} (
              {item.MedioTransporte.patente})
            </Text>

            {item.Reservas.map((reserva) => (
              <View key={reserva.id} style={styles.reservaBox}>
                <Text style={styles.label}>Reserva #{reserva.id}</Text>
                {reserva.Ventas.map((venta) => (
                  <View key={venta.id} style={styles.ventaBox}>
                    <Text>Pasajes: {venta.totalVentas}</Text>
                    <Text>
                      Fecha: {formatDate(venta.fecha)} - Hora:{" "}
                      {formatTime(venta.hora)}
                    </Text>
                    {venta.DetalleVenta.map((detalle) => (
                      <View key={detalle.id} style={styles.detalleBox}>
                        <Text>Forma de pago: {detalle.formaPago}</Text>
                        <Text>
                          Precio final: {formatCurrency(detalle.precioFinal)}
                        </Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            ))}
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
    textAlign: "right",
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  viajeTitulo: { fontSize: 18, fontWeight: "bold" },
  sub: { fontStyle: "italic", marginBottom: 6 },
  reservaBox: { marginTop: 10, paddingLeft: 10 },
  ventaBox: { marginTop: 6, paddingLeft: 10 },
  detalleBox: { marginTop: 4, paddingLeft: 10 },
  label: { fontWeight: "600", marginTop: 6 },
  empty: { color: "gray", marginTop: 20, textAlign: "center", fontSize: 16 },
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
  filtrosContainer: { marginBottom: 12 },
});
