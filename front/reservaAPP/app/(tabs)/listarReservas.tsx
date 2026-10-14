import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
} from "react-native";
import { obtenerReservasPorEmpresa } from "../../services/reservaService";
import { useAuth } from "@/context/AuthContext";
import { Redirect, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import Feather from "react-native-vector-icons/Feather";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/utils/dateFormatter";

interface Empresa {
  id: number;
  nombre: string;
}

interface MedioTransporte {
  id: number;
  nombre: string;
  patente: string;
  marca: string;
  cantLugares: number;
  Empresa: Empresa;
}

interface Viaje {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  horarioSalida: string;
  fechaViaje: string;
  precio: number;
  MedioTransporte: MedioTransporte;
}

interface Pasajero {
  nombre: string;
  apellido: string;
  dni: number;
  ubicacionOrigen: string;
  ubicacionDestino: string;
}

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
}

interface Reserva {
  id: number;
  fechaReserva: string;
  usuarios_id: number;
  viajes_id: number;
  Viaje: Viaje;
  Pasajeros: Pasajero[];
  Usuario: Usuario;
}

const SECTIONS = [
  "usuario",
  "pasajeros",
  "viaje",
  "transporte",
] as const;

type Section = (typeof SECTIONS)[number];

const ListarReservas = () => {
  const [expanded, setExpanded] = useState<Record<number, Record<Section, boolean>>>({});
  const [busqueda, setBusqueda] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);
  const [showPickerDesde, setShowPickerDesde] = useState(false);
  const [showPickerHasta, setShowPickerHasta] = useState(false);

  const { userInfo } = useAuth();
  const router = useRouter();

  if (
    !userInfo ||
    !["usuarioEmpresa", "usuarioMostrador"].includes(userInfo.perfil)
  ) {
    return <Redirect href="/(tabs)" />;
  }

  const fetchReservas = useCallback(
    () => obtenerReservasPorEmpresa(userInfo?.empresa_id),
    [userInfo?.empresa_id]
  );

  const { data: reservas = [], loading, error, refetch } = useAsyncData<Reserva[]>({
    fetchFn: fetchReservas,
    dependencies: [userInfo?.empresa_id],
  });

  useFocusEffect(
    useCallback(() => {
      setBusqueda("");
      setFechaDesde(null);
      setFechaHasta(null);
    }, [])
  );

  const hayFiltrosActivos =
    busqueda !== "" || fechaDesde !== null || fechaHasta !== null;

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaDesde(null);
    setFechaHasta(null);
  };

  const toggleSection = (reservaId: number, section: Section) => {
    setExpanded((prev) => ({
      ...prev,
      [reservaId]: {
        ...prev[reservaId],
        [section]: !prev[reservaId]?.[section],
      },
    }));
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const reservasFiltradas = useMemo(() => {
    const texto = busqueda.toLowerCase();
    return reservas.filter((reserva) => {
      const textoCoincide =
        reserva.id.toString().includes(texto) ||
        formatDate(reserva.fechaReserva).toLowerCase().includes(texto) ||
        formatDate(reserva.Viaje.fechaViaje).toLowerCase().includes(texto) ||
        reserva.Viaje.origenLocalidad.toLowerCase().includes(texto) ||
        reserva.Viaje.destinoLocalidad.toLowerCase().includes(texto) ||
        reserva.Usuario.nombre.toLowerCase().includes(texto) ||
        reserva.Usuario.apellido.toLowerCase().includes(texto) ||
        reserva.Viaje.MedioTransporte.nombre.toLowerCase().includes(texto) ||
        reserva.Viaje.MedioTransporte.patente.toLowerCase().includes(texto) ||
        reserva.Pasajeros?.some(
          (pasajero) =>
            pasajero.nombre.toLowerCase().includes(texto) ||
            pasajero.apellido.toLowerCase().includes(texto) ||
            pasajero.dni.toString().toLowerCase().includes(texto)
        );

      if (!textoCoincide) return false;

      const fechaReservaDate = new Date(reserva.fechaReserva);
      if (fechaDesde && fechaReservaDate < fechaDesde) return false;
      if (fechaHasta && fechaReservaDate > fechaHasta) return false;

      return true;
    });
  }, [reservas, busqueda, fechaDesde, fechaHasta]);

  const renderSectionHeader = (
    reservaId: number,
    section: Section,
    label: string
  ) => (
    <TouchableOpacity
      onPress={() => toggleSection(reservaId, section)}
      style={styles.sectionHeader}
    >
      <Text style={styles.subTitle}>{label}</Text>
      <Feather
        name={expanded[reservaId]?.[section] ? "chevron-up" : "chevron-down"}
        size={20}
        color="#4c68d7"
      />
    </TouchableOpacity>
  );

  const renderReserva = ({ item }: { item: Reserva }) => (
    <Card style={styles.card}>
      <Text style={styles.label}>
        N.° Reserva: <Text style={styles.value}>{item.id}</Text>
      </Text>
      <Text style={styles.label}>
        Fecha Reserva:{" "}
        <Text style={styles.value}>{formatDate(item.fechaReserva)}</Text>
      </Text>

      {renderSectionHeader(item.id, "usuario", "Datos del Usuario")}
      {expanded[item.id]?.usuario && (
        <View style={styles.details}>
          <Text style={styles.label}>
            Nombre:{" "}
            <Text style={styles.value}>
              {item.Usuario?.nombre} {item.Usuario?.apellido}
            </Text>
          </Text>
          <Text style={styles.label}>
            Email: <Text style={styles.value}>{item.Usuario?.email}</Text>
          </Text>
        </View>
      )}

      {renderSectionHeader(item.id, "pasajeros", "Datos de Pasajeros")}
      {expanded[item.id]?.pasajeros && item.Pasajeros?.length > 0 && (
        <View style={styles.details}>
          {item.Pasajeros.map((pasajero, index) => (
            <View key={index} style={{ marginBottom: 8 }}>
              <Text style={styles.label}>
                Nombre:{" "}
                <Text style={styles.value}>
                  {pasajero.nombre} {pasajero.apellido}
                </Text>
              </Text>
              <Text style={styles.label}>
                DNI: <Text style={styles.value}>{pasajero.dni}</Text>
              </Text>
              <Text style={styles.label}>
                Origen:{" "}
                <Text style={styles.value}>{pasajero.ubicacionOrigen}</Text>
              </Text>
              <Text style={styles.label}>
                Destino:{" "}
                <Text style={styles.value}>{pasajero.ubicacionDestino}</Text>
              </Text>
            </View>
          ))}
        </View>
      )}
      {expanded[item.id]?.pasajeros && !item.Pasajeros?.length && (
        <Text style={styles.details}>No hay pasajeros para esta reserva.</Text>
      )}

      {renderSectionHeader(item.id, "viaje", "Datos del Viaje")}
      {expanded[item.id]?.viaje && (
        <View style={styles.details}>
          <Text style={styles.label}>
            Origen:{" "}
            <Text style={styles.value}>{item.Viaje.origenLocalidad}</Text>
          </Text>
          <Text style={styles.label}>
            Destino:{" "}
            <Text style={styles.value}>{item.Viaje.destinoLocalidad}</Text>
          </Text>
          <Text style={styles.label}>
            Fecha Viaje:{" "}
            <Text style={styles.value}>{formatDate(item.Viaje.fechaViaje)}</Text>
          </Text>
          <Text style={styles.label}>
            Horario Salida:{" "}
            <Text style={styles.value}>{formatTime(item.Viaje.horarioSalida)}</Text>
          </Text>
          <Text style={styles.label}>
            Precio:{" "}
            <Text style={styles.value}>
              ${item.Viaje.precio.toLocaleString("es-AR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Text>
          </Text>
        </View>
      )}

      {renderSectionHeader(item.id, "transporte", "Datos del Transporte")}
      {expanded[item.id]?.transporte && (
        <View style={styles.details}>
          <Text style={styles.label}>
            Nombre:{" "}
            <Text style={styles.value}>{item.Viaje.MedioTransporte.nombre}</Text>
          </Text>
          <Text style={styles.label}>
            Patente:{" "}
            <Text style={styles.value}>{item.Viaje.MedioTransporte.patente}</Text>
          </Text>
          <Text style={styles.label}>
            Marca:{" "}
            <Text style={styles.value}>{item.Viaje.MedioTransporte.marca}</Text>
          </Text>
          <Text style={styles.label}>
            Lugares:{" "}
            <Text style={styles.value}>{item.Viaje.MedioTransporte.cantLugares}</Text>
          </Text>
        </View>
      )}
    </Card>
  );

  const header = (
    <>
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

      <Text style={styles.title}>
        {reservas.length > 0 ? reservas[0].Viaje.MedioTransporte.Empresa.nombre : ""} - Reservas
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Buscar por fecha, origen, destino, usuario, transporte..."
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
                  {fechaDesde ? formatDate(fechaDesde.toISOString()) : "Fecha desde"}
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
                  {fechaHasta ? formatDate(fechaHasta.toISOString()) : "Fecha hasta"}
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
    </>
  );

  return (
    <ScreenContainer
      loading={loading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      contentContainerStyle={styles.container}
    >
      {header}

      {reservasFiltradas.length === 0 ? (
        <Text style={styles.empty}>No hay reservas que coincidan con el filtro.</Text>
      ) : (
        <FlatList
          data={reservasFiltradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReserva}
          scrollEnabled={false}
        />
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  card: {
    marginBottom: 20,
    borderLeftWidth: 6,
    borderLeftColor: "#4c68d7",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  value: {
    fontWeight: "normal",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4c68d7",
    textDecorationLine: "underline",
  },
  details: {
    backgroundColor: "#f4f6f8",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#34495e",
    marginBottom: 14,
    textAlign: "left",
    borderBottomWidth: 2,
    borderBottomColor: "#4c68d7",
    paddingBottom: 6,
  },
  empty: { fontSize: 16, color: "gray", textAlign: "center", marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
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
  fechaButton: {
    backgroundColor: "#4c68d7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: -8,
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
    boxSizing: "border-box",
  },
  limpiarFiltrosButton: {
    backgroundColor: "#b2babb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: "#eaf0fa",
    borderRadius: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  fechaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 23,
  },
});

export default ListarReservas;
