import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  obtenerPasajeroPorId,
  actualizarReserva,
} from "../../services/reservaService"; // Asegúrate de tener estos servicios
import { useAuth } from "../../context/AuthContext";

export default function ModificarPasajero() {
  const { id, idReserva, idViaje } = useLocalSearchParams();
  const router = useRouter();
  const { logout, userInfo, isLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [pasajero, setPasajero] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    ubicacionOrigen: "",
    ubicacionDestino: "",
    reserva_id: null,
  });
  const [erroresBackend, setErroresBackend] = useState<{
    [key: string]: string;
  }>({});

  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioCliente") {
      logout();
      router.replace("/login");
    }
  }, [isLoading, userInfo]);

  if (isLoading || !userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datos = await obtenerPasajeroPorId(Number(id));
        const pasajeroData = datos[0];
        setPasajero({
          nombre: pasajeroData.nombre ?? "",
          apellido: pasajeroData.apellido ?? "",
          dni: pasajeroData.dni?.toString() ?? "",
          ubicacionOrigen:
            pasajeroData.ubicacionOrigen ??
            pasajeroData.reserva?.ubicacionOrigen ??
            "",
          ubicacionDestino:
            pasajeroData.ubicacionDestino ??
            pasajeroData.reserva?.ubicacionDestino ??
            "",
          reserva_id:
            pasajeroData.reserva_id ?? pasajeroData.reserva?.id ?? null,
        });
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar el pasajero");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (campo: string, valor: string) => {
    setPasajero((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleGuardar = async () => {
    try {
      setErroresBackend({});
      await actualizarReserva(Number(id), pasajero);

      Alert.alert("Éxito", "Pasajero actualizado correctamente");
      router.push({
        pathname: "/pantallas/detalleReserva",
        params: { idReserva: idReserva, id: idViaje },
      });
    } catch (error: any) {
      const errores = error?.response?.data?.errores;

      if (Array.isArray(errores)) {
        const erroresMap: { [key: string]: string } = {};
        errores.forEach((err: any) => {
          const campo = err.path?.split(".").pop(); // ejemplo: personas[0].nombre → nombre
          erroresMap[campo] = err.msg;
        });
        setErroresBackend(erroresMap);
      } else {
        Platform.OS === "web"
          ? alert(
              "Error: " + error?.response?.data?.mensaje ||
                "No se pudo actualizar el pasajero"
            )
          : Alert.alert(
              "Error",
              error?.response?.data?.mensaje ||
                "No se pudo actualizar el pasajero"
            );
      }
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" style={{ marginTop: 50 }} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#888"
          value={pasajero.nombre ?? ""}
          onChangeText={(text) => handleChange("nombre", text)}
        />
        {erroresBackend.nombre && (
          <Text style={styles.errorText}>{erroresBackend.nombre}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          placeholder="Apellido"
          placeholderTextColor="#888"
          value={pasajero.apellido ?? ""}
          onChangeText={(text) => handleChange("apellido", text)}
        />
        {erroresBackend.apellido && (
          <Text style={styles.errorText}>{erroresBackend.apellido}</Text>
        )}
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>DNI</Text>
        <TextInput
          style={styles.input}
          placeholder="DNI"
          placeholderTextColor="#888"
          value={String(pasajero.dni ?? "")}
          onChangeText={(text) => handleChange("dni", text)}
          keyboardType="numeric"
        />
        {erroresBackend.dni && (
          <Text style={styles.errorText}>{erroresBackend.dni}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ubicación Origen</Text>
        <TextInput
          style={styles.input}
          placeholder="Ubicación Origen. Ej. Jujuy 345"
          placeholderTextColor="#888"
          value={pasajero.ubicacionOrigen ?? ""}
          onChangeText={(text) => handleChange("ubicacionOrigen", text)}
        />
        {erroresBackend.ubicacionOrigen && (
          <Text style={styles.errorText}>{erroresBackend.ubicacionOrigen}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ubicación Destino</Text>
        <TextInput
          style={styles.input}
          placeholder="Ubicación Destino. Ej. Salta 345"
          placeholderTextColor="#888"
          value={pasajero.ubicacionDestino ?? ""}
          onChangeText={(text) => handleChange("ubicacionDestino", text)}
        />
        {erroresBackend.ubicacionDestino && (
          <Text style={styles.errorText}>
            {erroresBackend.ubicacionDestino}
          </Text>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "white",
  },
  button: {
    backgroundColor: "#4c68d7",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
});
