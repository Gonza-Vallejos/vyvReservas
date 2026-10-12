import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
  TextInput,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import {
  obtenerViajesPorEmpresa,
  eliminarViaje,
} from "../../services/viajeServices";
import { useAuth } from "../../context/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useFocusEffect } from "@react-navigation/native";

interface MedioTransporte {
  id: number;
  nombre: string;
  patente: string;
  marca: string;
  cantLugares: number;
  Empresa: {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
  };
}

interface Viaje {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  horarioSalida: string;
  fechaViaje: string;
  precio: number;
  usuarioEmpresa_id: number;
  MedioTransporte: MedioTransporte;
}

const ViajesEmpresa = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nombreEmpresa, setNombreEmpresa] = useState("");

  const { logout, userInfo } = useAuth();
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");

  // Estados para filtro por fechas
  const [fechaDesde, setFechaDesde] = useState<Date | null>(null);
  const [fechaHasta, setFechaHasta] = useState<Date | null>(null);

  const [showPickerDesde, setShowPickerDesde] = useState(false);
  const [showPickerHasta, setShowPickerHasta] = useState(false);

  const esMostrador = userInfo?.perfil === "usuarioMostrador";

  if (
    !userInfo ||
    !["usuarioEmpresa", "usuarioMostrador"].includes(userInfo.perfil)
  ) {
    logout();
    return <Redirect href="/login" />;
  }
  console.log("ver userinfo listar viajes", userInfo);
  useEffect(() => {
    const fetchViajes = async () => {
      try {
        if (!userInfo?.empresa_id) {
          setError("No se pudo obtener el ID de la empresa");
          return;
        }
        const data = await obtenerViajesPorEmpresa(userInfo?.empresa_id);
        setViajes(data);
        if (data.length > 0) {
          setNombreEmpresa(data[0].MedioTransporte.Empresa.nombre);
        }
      } catch (err) {
        setError("Error al obtener los viajes");
      } finally {
        setLoading(false);
      }
    };
    fetchViajes();
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

  const handleAgregar = () => {
    router.push({ pathname: "/pantallas/crearViaje" });
  };

  const handleVerReservas = (viajeId: number) => {
    router.push({
      pathname: "/pantallas/listarReservasPorViaje",
      params: { id: viajeId },
    });
  };

  const handleEditar = (viajeId: number) => {
    router.push({
      pathname: "/pantallas/editarViaje",
      params: { id: viajeId },
    });
  };

  const handleEliminar = (id: number) => {
    const confirmar =
      Platform.OS === "web"
        ? window.confirm("¿Estás seguro de que deseas eliminar este viaje?")
        : null;

    const continuar = Platform.OS === "web" ? confirmar : true;

    if (continuar) {
      if (Platform.OS !== "web") {
        Alert.alert(
          "Confirmar eliminación",
          "¿Estás seguro de que deseas eliminar este viaje?",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Sí, eliminar",
              style: "destructive",
              onPress: () => eliminarViajes(id),
            },
          ]
        );
      } else {
        eliminarViajes(id);
      }
    }
  };

  const eliminarViajes = async (id: number) => {
    try {
      await eliminarViaje(id);
      setViajes((prev) => prev.filter((v) => v.id !== id));

      Platform.OS === "web"
        ? alert("Viaje eliminado correctamente")
        : Alert.alert("Viaje eliminado correctamente");
    } catch (error: any) {
      const mensajeError =
        error.response?.data?.error || "Error al eliminar el viaje.";
      console.error("Error al eliminar viaje:", error);
      Platform.OS === "web"
        ? alert("Advertencia: " + mensajeError)
        : Alert.alert("Advertencia", mensajeError);
    }
  };

  // Filtrado combinado (texto + fechas)
  const viajesFiltrados = viajes.filter((viaje) => {
    const texto = busqueda.toLowerCase();

    const textoCoincide =
      viaje.id.toString().includes(texto) ||
      formatDate(viaje.fechaViaje).toLowerCase().includes(texto) ||
      formatTime(viaje.horarioSalida).toLowerCase().includes(texto) ||
      viaje.origenLocalidad.toLowerCase().includes(texto) ||
      viaje.destinoLocalidad.toLowerCase().includes(texto) ||
      viaje.MedioTransporte.nombre.toLowerCase().includes(texto) ||
      viaje.MedioTransporte.patente.toLowerCase().includes(texto);

    if (!textoCoincide) return false;

    const fechaViajeDate = new Date(viaje.fechaViaje);

    const dentroRangoDesde = fechaDesde ? fechaViajeDate >= fechaDesde : true;
    const dentroRangoHasta = fechaHasta ? fechaViajeDate <= fechaHasta : true;

    return dentroRangoDesde && dentroRangoHasta;
  });

  //  Dividir viajes en futuros y pasados
  const ahora = new Date();
  const viajesFuturos = viajesFiltrados.filter(
    (viaje) => new Date(viaje.fechaViaje) >= ahora
  );
  const viajesPasados = viajesFiltrados.filter(
    (viaje) => new Date(viaje.fechaViaje) < ahora
  );

  const limpiarFiltros = () => {
    setBusqueda("");
    setFechaDesde(null);
    setFechaHasta(null);
  };

  const renderViaje = (viaje: Viaje, esPasado = false) => (
    <View
      key={viaje.id}
      style={[
        styles.viajeCard,
        esPasado && styles.viajePasadoCard, // Estilo oscuro para viajes pasados
      ]}
    >
      <Text style={[styles.viajeRuta]}>
        {" "}
        {viaje.origenLocalidad} → {viaje.destinoLocalidad}{" "}
      </Text>

      <View style={styles.viajeInfoRow}>
        <Text style={styles.viajeLabel}>Fecha:</Text>
        <Text style={[styles.viajeValor, esPasado && { color: "#888" }]}>
          {formatDate(viaje.fechaViaje)}
        </Text>
      </View>

      <View style={styles.viajeInfoRow}>
        <Text style={styles.viajeLabel}>Hora:</Text>
        <Text style={[styles.viajeValor, esPasado && { color: "#888" }]}>
          {formatTime(viaje.horarioSalida)}
        </Text>
      </View>

      <View style={styles.viajeInfoRow}>
        <Text style={styles.viajeLabel}>Precio:</Text>
        <Text style={[styles.viajeValor, esPasado && { color: "#888" }]}>
          $
          {viaje.precio.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      </View>

      <View style={styles.viajeInfoRow}>
        <Text style={styles.viajeLabel}>Transporte:</Text>
        <Text style={[styles.viajeValor, esPasado && { color: "#888" }]}>
          {viaje.MedioTransporte.nombre} ({viaje.MedioTransporte.patente})
        </Text>
      </View>

      <View style={styles.viajeInfoRow}>
        <Text style={styles.viajeLabel}>Empresa:</Text>
        <Text style={[styles.viajeValor, esPasado && { color: "#888" }]}>
          {viaje.MedioTransporte.Empresa.nombre}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable
          onPress={() => handleVerReservas(viaje.id)}
          style={styles.botonDetalle}
        >
          <Text style={styles.textoBotonDetalle}>Ver Reservas</Text>
        </Pressable>

        {/* Mostrar Editar y Eliminar solo si no es pasado */}
        {!esPasado && esMostrador && (
          <>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditar(viaje.id)}
            >
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleEliminar(viaje.id)}
            >
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
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
    <ScrollView style={styles.container}>
      <View style={styles.filaBotones}>
        {esMostrador && (
          <TouchableOpacity
            style={styles.agregarButton}
            onPress={handleAgregar}
          >
            <Text style={styles.agregarButtonText}>+ Agregar Viaje</Text>
          </TouchableOpacity>
        )}
        {hayFiltrosActivos && (
          <TouchableOpacity
            onPress={limpiarFiltros}
            style={styles.limpiarFiltrosButton}
          >
            <Text style={styles.limpiarFiltrosText}>Limpiar filtros</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionTitle}>{nombreEmpresa} - Viajes</Text>

      {/* Input búsqueda */}
      <TextInput
        style={styles.input}
        placeholder="Buscar por fecha, origen, destino, transporte..."
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

      {/*  Viajes Futuros */}
      {viajesFuturos.map((viaje) => renderViaje(viaje, false))}

      {/*  Viajes Pasados */}
      {viajesPasados.length > 0 && (
        <>
          <Text style={{ fontSize: 18, fontWeight: "bold", marginTop: 20 }}>
            Viajes Pasados
          </Text>
          {viajesPasados.map((viaje) => renderViaje(viaje, true))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  viajeCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 6,
    borderLeftColor: "#4c68d7",
  },
  viajePasadoCard: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 0,
    borderLeftWidth: 6,
    borderLeftColor: "#4c68d7",
    backgroundColor: "#3332",
    flex: 1,
  },

  viajeRuta: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 12,
  },

  viajeInfoRow: {
    flexDirection: "row",
    marginBottom: 6,
  },

  viajeLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#555",
    marginRight: 4,
  },

  viajeValor: {
    fontSize: 14,
    color: "#333",
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 10,
  },

  botonDetalle: {
    backgroundColor: "#17a589",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 6,
  },

  textoBotonDetalle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  editButton: {
    backgroundColor: "#4c68d7",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 6,
  },

  deleteButton: {
    backgroundColor: "#F44336",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#34495e",
    marginBottom: 14,
    textAlign: "left",
    borderBottomWidth: 2,
    borderBottomColor: "#4c68d7",
    paddingBottom: 6,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },

  reservaItem: {
    backgroundColor: "#3332",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
  },

  title: {
    fontWeight: "bold",
    fontSize: 16,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  filaBotones: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 12,
  },
  agregarButton: {
    backgroundColor: "#4c68d7",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  agregarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
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

  limpiarFiltrosText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});

export default ViajesEmpresa;
