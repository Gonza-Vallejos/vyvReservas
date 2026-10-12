import React, { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  obtenerEmpresaPorId,
  actualizarEmpresa,
} from "../../services/empresaService";
import { useAuth } from "../../context/AuthContext";

export default function ModificarEmpresa() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isLoading, logout, userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [empresa, setEmpresa] = useState({
    nombre: "",
    direccion: "",
    cuit: "",
    telefono: "",
    email: "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datos = await obtenerEmpresaPorId(Number(id));
        const empresaData = datos[0];

        setEmpresa({
          nombre: empresaData.nombre ?? "",
          direccion: empresaData.direccion ?? "",
          cuit: empresaData.cuit?.toString() ?? "",
          telefono: empresaData.telefono?.toString() ?? "",
          email: empresaData.email ?? "",
        });
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar la empresa");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (campo: string, valor: string) => {
    setEmpresa((prev) => ({ ...prev, [campo]: valor }));
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await actualizarEmpresa(Number(id), empresa);
      Alert.alert("Éxito", "Empresa actualizada correctamente");
      router.back();
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar la empresa");
    } finally {
      setGuardando(false);
    }
  };
  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioEmpresa") {
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
          value={empresa.nombre ?? ""}
          onChangeText={(text) => handleChange("nombre", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Dirección</Text>
        <TextInput
          style={styles.input}
          placeholder="Dirección"
          value={empresa.direccion}
          onChangeText={(text) => handleChange("direccion", text)}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>CUIT</Text>
        <TextInput
          style={[styles.input, { backgroundColor: "#eee" }]}
          placeholder="CUIT"
          value={empresa.cuit}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          value={empresa.telefono}
          onChangeText={(text) => handleChange("telefono", text)}
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={empresa.email}
          onChangeText={(text) => handleChange("email", text)}
          keyboardType="email-address"
        />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handleGuardar}
        disabled={guardando}
      >
        <Text style={styles.buttonText}>
          {guardando ? "Guardando..." : "Guardar Cambios"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
    elevation: 5,
    transform: [{ scale: 1 }],
    transitionDuration: "200ms",
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#000",
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
