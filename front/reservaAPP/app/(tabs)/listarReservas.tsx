import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Button,
  ScrollView,
} from "react-native";
import { obtenerReservasPorEmpresa } from "../../services/reservaService";
import { useAuth } from "@/context/AuthContext";
import { Redirect, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import Feather from "react-native-vector-icons/Feather";

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

const ListarReservas = () => {
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [expanded, setExpanded] = useState<{
    [key: number]: {
      viaje: boolean;
      transporte: boolean;
      empresa: boolean;
      pasajeros: boolean;
      usuario: boolean;
    };
  }>({});
  const [busqueda, setBusqueda] = useState("");

  // Estados para filtro por fechas
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);

  const [showPickerDesde, setShowPickerDesde] = useState(false);
  const [showPickerHasta, setShowPickerHasta] = useState(false);
  const { logout, userInfo } = useAuth();
  const router = useRouter();

  if (
    !userInfo ||
    !["usuarioEmpresa", "usuarioMostrador"].includes(userInfo.perfil)
  ) {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const fetchReservas = async () => {
      try {
        const data = await obtenerReservasPorEmpresa(userInfo?.empresa_id);
        setReservas(data);
      } catch (error) {
        console.error("Error al obtener reservas:", error);
      }
    };

    fetchReservas();
  }, []);
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
  const toggleSection = (
    reservaId: number,
    section: "viaje" | "transporte" | "empresa" | "pasajeros" | "usuario"
  ) => {
    setExpanded((prev) => ({
      ...prev,
      [reservaId]: {
        ...prev[reservaId],
        [section]: !prev[reservaId]?.[section],
      },
    }));
  };

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

  // Convierte fecha formateada DD/MM/YYYY a objeto Date para comparar
  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split("/");
    return new Date(Number(year), Number(month) - 1, Number(day));
  };

  // Filtrado combinado (busqueda texto + filtro fechas)
  const reservasFiltradas = reservas.filter((reserva) => {
    const texto = busqueda.toLowerCase();

    // Busca coincidencia texto
    const textoCoincide =
      reserva.id.toString().includes(texto) ||
      formatDate(reserva.fechaReserva).toLowerCase().includes(texto) ||
      formatDate(reserva.Viaje.fechaViaje).toLowerCase().includes(texto) ||
      reserva.Viaje.origenLocalidad.toLowerCase().includes(texto) ||
      reserva.Viaje.destinoLocalidad.toLowerCase().includes(texto) ||
      reserva.Usuario.nombre.toLowerCase().includes(texto) ||
      reserva.Usuario.apellido.toLowerCase().includes(texto) ||
      reserva.Viaje.MedioTransporte.nombre.toLowerCase().includes(texto) ||
      reserva.Viaje.MedioTransporte.patente.toLowerCase().includes(texto);
    reserva.Pasajeros &&
      reserva.Pasajeros.some(
        (pasajero) =>
          pasajero.nombre.toLowerCase().includes(texto) ||
          pasajero.apellido.toLowerCase().includes(texto) ||
          pasajero.dni.toString().toLowerCase().includes(texto)
      );
    // Si no coincide texto, lo ignoramos directamente
    if (!textoCoincide) return false;

    // Ahora filtramos por fechas, si están definidas
    const fechaReservaDate = new Date(reserva.fechaReserva);
    const fechaViajeDate = new Date(reserva.Viaje.fechaViaje);

    // Queremos que la fechaReserva O fechaViaje estén dentro del rango de fechaDesde y fechaHasta

    const dentroRangoDesde = fechaDesde ? fechaReservaDate >= fechaDesde : true;
    const dentroRangoHasta = fechaHasta ? fechaReservaDate <= fechaHasta : true;

    return dentroRangoDesde && dentroRangoHasta;
  });

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
      <Text style={styles.title}>
        {reservas.length > 0
          ? reservas[0].Viaje.MedioTransporte.Empresa.nombre
          : ""}{" "}
        - Reservas
      </Text>

      {/* Input búsqueda */}
      <TextInput
        style={styles.input}
        placeholder="Buscar por fecha, origen, destino, usuario, transporte..."
        placeholderTextColor="#888"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      {/* Filtros de fecha */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 23,
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

      {reservasFiltradas.length === 0 ? (
        <Text style={styles.empty}>
          No hay reservas que coincidan con el filtro.
        </Text>
      ) : (
        <FlatList
          data={reservasFiltradas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.label}>
                N.° Reserva: <Text style={styles.value}>{item.id}</Text>
              </Text>
              <Text style={styles.label}>
                Fecha Reserva:{" "}
                <Text style={styles.value}>
                  {formatDate(item.fechaReserva)}
                </Text>
              </Text>

              {/* Sección Datos del Usuario */}
              <TouchableOpacity
                onPress={() => toggleSection(item.id, "usuario")}
                style={styles.sectionHeader}
              >
                <Text style={styles.subTitle}>Datos del Usuario</Text>
                <Feather
                  name={
                    expanded[item.id]?.usuario ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color="#4c68d7"
                />
              </TouchableOpacity>
              {expanded[item.id]?.usuario && (
                <View style={styles.details}>
                  <Text style={styles.label}>
                    Nombre:{" "}
                    <Text style={styles.value}>
                      {item.Usuario?.nombre} {item.Usuario?.apellido}
                    </Text>
                  </Text>
                  <Text style={styles.label}>
                    Email:{" "}
                    <Text style={styles.value}>{item.Usuario?.email}</Text>
                  </Text>
                </View>
              )}

              {/* Sección Datos de los Pasajeros */}
              <TouchableOpacity
                onPress={() => toggleSection(item.id, "pasajeros")}
                style={styles.sectionHeader}
              >
                <Text style={styles.subTitle}>Datos de Pasajeros</Text>
                <Feather
                  name={
                    expanded[item.id]?.pasajeros ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color="#4c68d7"
                />
              </TouchableOpacity>
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
                        <Text style={styles.value}>
                          {pasajero.ubicacionOrigen}
                        </Text>
                      </Text>
                      <Text style={styles.label}>
                        Destino:{" "}
                        <Text style={styles.value}>
                          {pasajero.ubicacionDestino}
                        </Text>
                      </Text>
                    </View>
                  ))}
                </View>
              )}
              {expanded[item.id]?.pasajeros &&
                (!item.Pasajeros || item.Pasajeros.length === 0) && (
                  <Text style={styles.details}>
                    No hay pasajeros para esta reserva.
                  </Text>
                )}

              {/* Sección Datos del Viaje */}
              <TouchableOpacity
                onPress={() => toggleSection(item.id, "viaje")}
                style={styles.sectionHeader}
              >
                <Text style={styles.subTitle}>Datos del Viaje</Text>
                <Feather
                  name={
                    expanded[item.id]?.viaje ? "chevron-up" : "chevron-down"
                  }
                  size={20}
                  color="#4c68d7"
                />
              </TouchableOpacity>
              {expanded[item.id]?.viaje && (
                <View style={styles.details}>
                  <Text style={styles.label}>
                    Origen:{" "}
                    <Text style={styles.value}>
                      {item.Viaje.origenLocalidad}
                    </Text>
                  </Text>
                  <Text style={styles.label}>
                    Destino:{" "}
                    <Text style={styles.value}>
                      {item.Viaje.destinoLocalidad}
                    </Text>
                  </Text>
                  <Text style={styles.label}>
                    Fecha Viaje:{" "}
                    <Text style={styles.value}>
                      {formatDate(item.Viaje.fechaViaje)}
                    </Text>
                  </Text>
                  <Text style={styles.label}>
                    Horario Salida:{" "}
                    <Text style={styles.value}>
                      {formatTime(item.Viaje.horarioSalida)}
                    </Text>
                  </Text>
                  <Text style={styles.label}>
                    Precio:{" "}
                    <Text style={styles.value}>
                      $
                      {item.Viaje.precio.toLocaleString("es-AR", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </Text>
                  </Text>
                </View>
              )}

              {/* Sección Datos del Transporte */}
              <TouchableOpacity
                onPress={() => toggleSection(item.id, "transporte")}
                style={styles.sectionHeader}
              >
                <Text style={styles.subTitle}>Datos del Transporte</Text>
                <Feather
                  name={
                    expanded[item.id]?.transporte
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  size={20}
                  color="#4c68d7"
                />
              </TouchableOpacity>
              {expanded[item.id]?.transporte && (
                <View style={styles.details}>
                  <Text style={styles.label}>
                    Nombre:{" "}
                    <Text style={styles.value}>
                      {item.Viaje.MedioTransporte.nombre}
                    </Text>
                  </Text>
                  <Text style={styles.label}>
                    Patente:{" "}
                    <Text style={styles.value}>
                      {item.Viaje.MedioTransporte.patente}
                    </Text>
                  </Text>
                  <Text style={styles.label}>
                    Marca:{" "}
                    <Text style={styles.value}>
                      {item.Viaje.MedioTransporte.marca}
                    </Text>
                  </Text>
                  <Text style={styles.label}>
                    Lugares:{" "}
                    <Text style={styles.value}>
                      {item.Viaje.MedioTransporte.cantLugares}
                    </Text>
                  </Text>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
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
    marginTop: 14,
    marginBottom: 6,
    textDecorationLine: "underline",
  },

  details: {
    backgroundColor: "#f4f6f8",
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
  },

  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
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

  agregarButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 5,
  },

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
    marginBottom: -8,
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

  dateInputWeb: {
    width: "100%",
    padding: 8,
    fontSize: 16,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#fff",
    boxSizing: "border-box", // importante en web para evitar overflow
  },
  limpiarFiltrosButton: {
    backgroundColor: "#b2babb",
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
});

export default ListarReservas;
