import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import {
  editarTransporte,
  obtenerTransporteId,
  verificarTransporteSinReservas,
} from "../../services/transporteService";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";

const EditarTransporte = () => {
  const [transporte, setTransporte] = useState({
    id: "",
    nombre: "",
    patente: "",
    marca: "",
    cantLugares: "",
  });
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const { isLoading, logout, userInfo } = useAuth();
  const [sinReservas, setSinReservas] = useState<boolean | null>(null);
  const [bloquearInput, setBloquearInput] = useState(false);
  const [mensajeBloqueo, setMensajeBloqueo] = useState("");

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const transporteData = await obtenerTransporteId(Number(id));

        if (!transporteData) {
          Alert.alert("No se encontró el transporte");
          return;
        }

        setTransporte({
          id: transporteData.id?.toString() ?? "",
          nombre: transporteData.nombre ?? "",
          patente: transporteData.patente ?? "",
          marca: transporteData.marca ?? "",
          cantLugares: transporteData.cantLugares?.toString() ?? "",
        });
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar el transporte");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioMostrador") {
      logout();
      router.replace("/login");
    }
  }, [isLoading, userInfo]);

  if (isLoading || !userInfo) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  const handleChange = (campo: string, valor: string) => {
    setTransporte((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleGuardar = async () => {
    if (!transporte.nombre || !transporte.cantLugares) {
      Alert.alert("Error", "Por favor, completa todos los campos obligatorios");
      return;
    }

    try {
      const nuevoTransporte = {
        nombre: transporte.nombre,
        cantLugares: parseInt(transporte.cantLugares),
        empresa_id: userInfo?.empresa_id,
      };

      await editarTransporte(Number(id), nuevoTransporte);
      Alert.alert("Éxito", "Transporte actualizado correctamente");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el transporte");
    }
  };
  const handleFocusInput = async () => {
    try {
      const res = await verificarTransporteSinReservas(transporte.id);
      console.log("ver booleannn de transporte ", res.sinReservas);
      if (!res.sinReservas) {
        setBloquearInput(true);
        setMensajeBloqueo(
          "No se puede modificar los lugares porque el transporte ya tiene reservas."
        );
      } else {
        setBloquearInput(false);
        setMensajeBloqueo("");
      }
    } catch (error) {
      console.error("Error al verificar disponibilidad:", error);
      setBloquearInput(true);
      setMensajeBloqueo("Ocurrió un error al verificar la disponibilidad.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#888"
          value={transporte.nombre}
          onChangeText={(text) => handleChange("nombre", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Patente</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#eee" }]}
          placeholder="Patente"
          placeholderTextColor="#888"
          value={transporte.patente}
          editable={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Marca</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#eee" }]}
          placeholder="Marca"
          placeholderTextColor="#888"
          value={transporte.marca}
          editable={false}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cantidad de Lugares</Text>
        <TextInput
          style={[
            styles.input,
            bloquearInput && { backgroundColor: "#eee", color: "#aaa" }, // estilo visual bloqueado
          ]}
          placeholder="Cantidad de Lugares"
          placeholderTextColor="#888"
          value={transporte.cantLugares}
          onChangeText={(text) => {
            if (!bloquearInput) {
              handleChange("cantLugares", text);
            }
          }}
          onFocus={handleFocusInput}
          keyboardType="numeric"
          editable={!bloquearInput}
        />
        {mensajeBloqueo !== "" && (
          <Text style={{ color: "red", marginTop: 4 }}>{mensajeBloqueo}</Text>
        )}
      </View>
      <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
        <Text style={styles.botonTexto}>Actualizar Transporte</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },

  botonGuardar: {
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
    elevation: 5,
    transform: [{ scale: 1 }],
    transitionDuration: "200ms",
    alignSelf: "center",
  },
  botonTexto: {
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
});

export default EditarTransporte;
