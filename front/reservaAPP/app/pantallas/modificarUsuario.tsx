import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
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
  Platform,
} from "react-native";
import {
  obtenerUsuarioPorId,
  actualizarUsuario,
} from "../../services/usuarioService";
import { useAuth } from "../../context/AuthContext";
import { Picker } from "@react-native-picker/picker";

// Tipo de errores por campo
type ErroresUsuario = {
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  usuario?: string;
};

export default function ModificarUsuario() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { logout, userInfo } = useAuth();
  const [perfilId, setPerfilId] = useState<any | null>(null);
  const [errores, setErrores] = useState<ErroresUsuario>({});

  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    usuario: "",
    contrsenia: "",
    perfil_id: "",
  });

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const datos = await obtenerUsuarioPorId(Number(id));
        const usuarioData = datos[0];

        setPerfilId(usuarioData.perfil_id);

        setUsuario({
          nombre: usuarioData.nombre ?? "",
          apellido: usuarioData.apellido ?? "",
          email: usuarioData.email ?? "",
          telefono: usuarioData.telefono?.toString() ?? "",
          usuario: usuarioData.usuario ?? "",
          contrsenia: usuario.contrsenia ?? "",
          perfil_id: usuarioData.perfil_id?.toString() ?? "",
        });
      } catch (error) {
        Alert.alert("Error", "No se pudo cargar el usuario");
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const handleChange = (campo: string, valor: string) => {
    setUsuario((prev) => ({ ...prev, [campo]: valor }));
    setErrores((prev) => ({ ...prev, [campo]: "" }));
  };

  const handleGuardar = async () => {
    try {
      await actualizarUsuario(Number(id), usuario);
      if (Platform.OS === "web") {
        window.alert("Perfil actualizado correctamente");
      } else {
        Alert.alert("Éxito", "Perfil actualizado correctamente");
      }

      router.push("/(tabs)/perfil");
    } catch (error: any) {
      const erroresResponse = error?.response?.data?.errores;

      if (erroresResponse && Array.isArray(erroresResponse)) {
        const erroresFormateados: ErroresUsuario = {};
        erroresResponse.forEach((err: any) => {
          erroresFormateados[err.path as keyof ErroresUsuario] = err.msg;
        });
        setErrores(erroresFormateados);
      } else {
        const mensajeError =
          error?.response?.data?.error || "Error al actualizar el usuario.";
        Alert.alert("Error", mensajeError);
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
          value={usuario.nombre ?? ""}
          onChangeText={(text) => handleChange("nombre", text)}
        />
        {errores.nombre && (
          <Text style={styles.errorText}>{errores.nombre}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Apellido</Text>
        <TextInput
          style={styles.input}
          placeholder="Apellido"
          placeholderTextColor="#888"
          value={usuario.apellido ?? ""}
          onChangeText={(text) => handleChange("apellido", text)}
        />
        {errores.apellido && (
          <Text style={styles.errorText}>{errores.apellido}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#888"
          value={usuario.email ?? ""}
          onChangeText={(text) => handleChange("email", text)}
          keyboardType="email-address"
        />
        {errores.email && <Text style={styles.errorText}>{errores.email}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          placeholder="Teléfono"
          placeholderTextColor="#888"
          value={usuario.telefono ?? ""}
          onChangeText={(text) => handleChange("telefono", text)}
          keyboardType="numeric"
        />
        {errores.telefono && (
          <Text style={styles.errorText}>{errores.telefono}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          style={styles.input}
          placeholder="Usuario"
          placeholderTextColor="#888"
          value={usuario.usuario ?? ""}
          onChangeText={(text) => handleChange("usuario", text)}
        />
        {errores.usuario && (
          <Text style={styles.errorText}>{errores.usuario}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleGuardar}>
        <Text style={styles.buttonText}>Guardar Cambios</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
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
  input: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 10,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: "white",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
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
    marginTop: 12,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
