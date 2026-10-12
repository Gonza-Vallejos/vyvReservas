import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import { actualizarContraseña } from "../../services/usuarioService";
import { useAuth } from "../../context/AuthContext";

//errores
type Errores = {
  contrasenia?: string;
  nueva?: string;
  repetir?: string;
};

export default function ModificarContrasenia() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [contraseñaActual, setContraseñaActual] = useState("");
  const [nuevaContraseña, setNuevaContraseña] = useState("");
  const [repetirContraseña, setRepetirContraseña] = useState("");
  const [errores, setErrores] = useState<Errores>({});
    const { logout, userInfo } = useAuth();

  const handleGuardar = async () => {
    const nuevosErrores: Errores = {};
  

    // Validación de campos vacíos
    if (!contraseñaActual) {
      nuevosErrores.contrasenia = "La contraseña actual es obligatoria";
    }

    if (!nuevaContraseña) {
      nuevosErrores.nueva = "La nueva contraseña es obligatoria";
    }

    if (!repetirContraseña) {
      nuevosErrores.repetir = "Debes repetir la nueva contraseña";
    }

    // Validación de coincidencia
    if (nuevaContraseña !== repetirContraseña) {
      nuevosErrores.repetir = "Las contraseñas no coinciden";
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    // Si todo está bien, limpiamos errores y continuamos
    setErrores({});

    try {
      const payload = {
        contraseniaActual: contraseñaActual,
        nuevaContrasenia: nuevaContraseña,
      };

      await actualizarContraseña(Number(id), payload);

      Alert.alert("Éxito", "Contraseña actualizada correctamente");
      router.push("/login");
    } catch (error: any) {
      const erroresFormateados: Errores = {};

      if (error.error) {
        erroresFormateados.contrasenia = error.error;
      } else if (error.mensaje) {
        erroresFormateados.contrasenia = error.mensaje;
      } else if (Array.isArray(error.errors)) {
        error.errors.forEach((err: any) => {
          erroresFormateados[err.path as keyof Errores] = err.msg;
        });
      } else {
        erroresFormateados.contrasenia = "No se pudo actualizar la contraseña";
      }

      setErrores(erroresFormateados);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Contraseña Actual</Text>
        {errores.contrasenia && (
          <Text style={styles.errorText}>{errores.contrasenia}</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Contraseña Actual"
          placeholderTextColor="#888"
          secureTextEntry
          value={contraseñaActual}
          onChangeText={setContraseñaActual}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nueva Contraseña</Text>
        {errores.nueva && <Text style={styles.errorText}>{errores.nueva}</Text>}
        <TextInput
          style={styles.input}
          placeholder="Nueva Contraseña"
          placeholderTextColor="#888"
          secureTextEntry
          value={nuevaContraseña}
          onChangeText={setNuevaContraseña}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Repetir Nueva Contraseña</Text>
        {errores.repetir && (
          <Text style={styles.errorText}>{errores.repetir}</Text>
        )}
        <TextInput
          style={styles.input}
          placeholder="Repetir Nueva Contraseña"
          placeholderTextColor="#888"
          secureTextEntry
          value={repetirContraseña}
          onChangeText={setRepetirContraseña}
        />
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
  input: {
    borderWidth: 1,
    borderColor: "#999",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "white",
    color: "black"
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
    marginTop: 20,
    alignSelf: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 5,
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
