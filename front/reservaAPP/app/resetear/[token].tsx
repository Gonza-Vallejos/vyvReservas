import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useColorScheme,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { resetearContrasenia } from "../../services/authService";

export default function ResetearContraseniaScreen() {
  const { token } = useLocalSearchParams(); // token desde la URL
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [nuevaContrasenia, setNuevaContrasenia] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const isDark = colorScheme === "dark";

  const handleReset = async () => {
    setMensaje("");
    setError("");

    const pwd = nuevaContrasenia;

    // Validaciones avanzadas (igual que en middleware)
    if (!pwd) {
      setError("La contraseña es obligatoria.");
      return;
    }
    if (pwd.length < 8 || pwd.length > 12) {
      setError("La contraseña debe tener entre 8 y 12 caracteres.");
      return;
    }
    if (!/[A-Z]/.test(pwd)) {
      setError("La contraseña debe contener al menos una letra mayúscula.");
      return;
    }
    if (!/[a-z]/.test(pwd)) {
      setError("La contraseña debe contener al menos una letra minúscula.");
      return;
    }
    if (!/[0-9]/.test(pwd)) {
      setError("La contraseña debe contener al menos un número.");
      return;
    }
    if (!/[@$!%*?#_.&]/.test(pwd)) {
      setError(
        "La contraseña debe contener al menos un carácter especial (@$!%*?#_.&)."
      );
      return;
    }

    try {
      await resetearContrasenia(token as string, pwd);
      setMensaje("Tu contraseña fue actualizada con éxito.");
      setNuevaContrasenia("");

      // Redirigir luego de unos segundos (opcional)
      setTimeout(() => router.replace("/login"), 2000);
    } catch (err: any) {
      const mensaje =
        err.response?.data?.mensaje ||
        "Error al actualizar la contraseña. Asegurate de que el enlace sea válido.";
      setError(mensaje);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
        <ImageBackground
              source={require("../../assets/images/fondo3.jpg")}
              style={styles(isDark).backgroundImage}
            >
      <ScrollView
        contentContainerStyle={styles(isDark).wrapper}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles(isDark).formContainer}>
          <Text style={styles(isDark).title}>Restablecer contraseña</Text>

          <TextInput
            style={styles(isDark).input}
            placeholder="Nueva contraseña"
            placeholderTextColor={isDark ? "#ccc" : "#888"}
             secureTextEntry={!mostrarPassword}
            value={nuevaContrasenia}
            onChangeText={setNuevaContrasenia}
          />
          <Pressable
            onPress={() => setMostrarPassword((prev) => !prev)}
            style={{
              position: "absolute", right: 30, top: "40%" 
            }}
          >
            <Ionicons
              name={mostrarPassword ? "eye-off" : "eye"}
              size={22}
              color={isDark ? "#ccc" : "#555"}
            />
          </Pressable>

          {error !== "" && <Text style={styles(isDark).error}>{error}</Text>}
          {mensaje !== "" && (
            <Text style={styles(isDark).mensaje}>{mensaje}</Text>
          )}

          <Pressable style={styles(isDark).button} onPress={handleReset}>
            <Text style={styles(isDark).buttonText}>Cambiar contraseña</Text>
          </Pressable>
        </View>
      </ScrollView>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const styles = (isDark: boolean) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
     // backgroundColor: isDark ? "#000" : "#fff",
      paddingHorizontal: 20,
    },
    formContainer: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: isDark ? "#111" : "#f2f2f2",
      padding: 24,
      borderRadius: 12,
      elevation: 3,
    },
    title: {
      fontSize: 22,
      fontWeight: "bold",
      color: "#007AFF",
      marginBottom: 20,
      textAlign: "center",
    },
    input: {
      height: 48,
      borderColor: "#007AFF",
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: 12,
      paddingHorizontal: 12,
      color: isDark ? "#fff" : "#000",
      backgroundColor: isDark ? "#1a1a1a" : "#fff",
    },
    button: {
      backgroundColor: "#4c68d7",
      paddingVertical: 12,
      borderRadius: 20,
      alignItems: "center",
      marginTop: 10,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
    },
    error: {
      color: "red",
      marginBottom: 10,
      textAlign: "center",
    },
    mensaje: {
      color: "green",
      marginBottom: 10,
      textAlign: "center",
    },
   backgroundImage: {
      flex: 1,
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
  });
