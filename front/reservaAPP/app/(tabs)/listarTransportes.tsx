import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import {
  obtenerTransportePorEmpresa,
  eliminarTransporte,
} from "../../services/transporteService";
import { useAuth } from "@/context/AuthContext";
import { Redirect, router } from "expo-router";

interface Empresa {
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

const ListarTransportes = () => {
  const [transportes, setTransportes] = useState<MedioTransporte[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const { logout, userInfo } = useAuth();
  const navigation = useNavigation();

  const esMostrador = userInfo?.perfil === "usuarioMostrador";

  if (
    !userInfo ||
    !["usuarioEmpresa", "usuarioMostrador"].includes(userInfo.perfil)
  ) {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const fetchTransportes = async () => {
      try {
        if (userInfo?.empresa_id) {
          const data = await obtenerTransportePorEmpresa(userInfo?.empresa_id);
          setTransportes(data);
        }
      } catch (error) {
        console.error("Error al obtener transportes:", error);
      }
    };

    fetchTransportes();
  }, []);

  const hayFiltrosActivos = busqueda !== "";
  const handleEliminar = async (id: number) => {
    if (Platform.OS === "web") {
      const confirmar = window.confirm(
        "¿Estás seguro de que deseas dar de baja este transporte?"
      );
      if (confirmar) {
        await eliminar(id); // llamada directa si confirma
      }
    } else {
      Alert.alert(
        "Confirmar eliminación",
        "¿Estás seguro de que deseas dar de baja este transporte?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sí, eliminar",
            style: "destructive",
            onPress: () => eliminar(id), // llamada dentro del onPress
          },
        ]
      );
    }
  };

  const eliminar = async (id: number) => {
    try {
      await eliminarTransporte(id);
      setTransportes((prev) => prev.filter((t) => t.id !== id));

      if (Platform.OS === "web") {
        alert("Transporte eliminado correctamente"); // alert simple en web
      } else {
        Alert.alert("Transporte eliminado correctamente"); // alert nativo en celu
      }
    } catch (error: any) {
      console.error("Error al eliminar transporte:", error.response?.data);
      const mensajeError =
        error.response?.data?.error || "Error al eliminar el transporte.";

      if (Platform.OS === "web") {
        alert("Atención!! " + mensajeError);
      } else {
        Alert.alert("Atención!!", mensajeError);
      }
    }
  };

  const transporteFiltrados = transportes.filter((transporte) => {
    const texto = busqueda.toLowerCase();

    return (
      transporte.nombre.toLowerCase().includes(texto) ||
      transporte.marca.toLowerCase().includes(texto) ||
      transporte.patente.toLowerCase().includes(texto)
    );
  });

  const limpiarFiltros = () => {
    setBusqueda("");
  };

  const handleEditar = (id: number) => {
    router.push({
      pathname: "/pantallas/editarTransporte",
      params: { id: id },
    });
  };

  const handleAgregar = () => {
    router.push({ pathname: "/pantallas/crearTransporte" });
  };

  const handleListarChoferes = () => {
    router.push({ pathname: "/empresaUsuarios" });
  };

  return (
    <View style={styles.container}>
      <View style={styles.filaBotones}>
        {esMostrador && (
          <TouchableOpacity
            style={styles.agregarButton}
            onPress={handleAgregar}
          >
            <Text style={styles.agregarButtonText}>+ Agregar Transporte</Text>
          </TouchableOpacity>
        )}

        {esMostrador && (
          <TouchableOpacity
            style={styles.agregarButton}
            onPress={handleListarChoferes}
          >
            <Text style={styles.agregarButtonText}>Ver Choferes</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.filaBotones}>
        {hayFiltrosActivos && (
          <TouchableOpacity
            style={styles.limpiarFiltrosButton}
            onPress={limpiarFiltros}
          >
            <Text style={styles.limpiarFiltrosText}>Limpiar Filtros</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title}>
        {transportes.length > 0
          ? `${transportes[0].Empresa.nombre} - Transportes`
          : "Transportes"}
      </Text>
      {/* Input búsqueda */}
      <TextInput
        style={styles.input}
        placeholder="Buscar por nombre, marca o patente..."
        placeholderTextColor="#888"
        value={busqueda}
        onChangeText={setBusqueda}
      />
      {transporteFiltrados.length === 0 ? (
        <Text style={styles.empty}>
          No hay transportes activos para esta empresa.
        </Text>
      ) : (
        <FlatList
          data={transporteFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.transporteCard}>
              <Text style={styles.transporteNombre}>{item.nombre}</Text>

              <View style={styles.transporteInfoRow}>
                <Text style={styles.transporteLabel}>Patente:</Text>
                <Text style={styles.transporteValor}>{item.patente}</Text>
              </View>
              <View style={styles.transporteInfoRow}>
                <Text style={styles.transporteLabel}>Marca:</Text>
                <Text style={styles.transporteValor}>{item.marca}</Text>
              </View>
              <View style={styles.transporteInfoRow}>
                <Text style={styles.transporteLabel}>Lugares:</Text>
                <Text style={styles.transporteValor}>{item.cantLugares}</Text>
              </View>

              {esMostrador && (
                <View style={styles.transporteBotones}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => handleEditar(item.id)}
                  >
                    <Text style={styles.buttonText}>Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleEliminar(item.id)}
                  >
                    <Text style={styles.buttonText}>Eliminar</Text>
                  </TouchableOpacity>
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
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  agregarButton: {
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
    elevation: 5,
    transform: [{ scale: 1 }],
    transitionDuration: "200ms",
  },
  agregarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
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
  card: {
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  label: { fontSize: 14, fontWeight: "bold" },
  value: { fontWeight: "normal" },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },

  editButton: {
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

  deleteButton: {
    backgroundColor: "#F44336",
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
  buttonText: { color: "#fff", fontWeight: "bold" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },

  filtrosHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 10,
  },

  filaBotones: {
    flexDirection: "row-reverse",
    justifyContent: "flex-start",
    gap: 8,
    marginBottom: 12,
  },

  dateInputWeb: {
    padding: 10,
    width: "100%",
    borderRadius: 8,
    fontSize: 14,
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
  limpiarFiltrosText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  transporteCard: {
    backgroundColor: "#fefefe",
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#4c68d7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },

  transporteNombre: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },

  transporteInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  transporteLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#555",
    marginRight: 6,
  },

  transporteValor: {
    fontSize: 15,
    color: "#1a1a1a",
  },

  transporteBotones: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
    gap: 12,
  },
});

export default ListarTransportes;
