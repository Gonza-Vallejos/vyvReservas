import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { enviarEmailRecuperacion } from "../services/authService";

export default function RecuperarContrasenia() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const isDark = colorScheme === "dark";

  function esEmailValido(email: string) {
    // No permitir espacios antes ni después del @ y formato estándar
    const re =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    // Además, no permitir espacios en todo el email
    if (/\s/.test(email)) return false;
    // Además, no permitir espacios justo después del @
    if (/@\s/.test(email)) return false;
    return re.test(email.trim());
  }

  const handleRecuperar = async () => {
    setError("");
    setMensaje("");
    setLoading(true); // mostrar spinner

    // Validación: campo vacío
    if (!email || email.trim() === "") {
      setError("Por favor, ingresá tu correo electrónico.");
      setLoading(false);
      return;
    }
    // Validación: formato de email
    if (!esEmailValido(email)) {
      setError("Ingresá un correo electrónico válido.");
      setLoading(false);
      return;
    }

    // Validación: evitar caracteres peligrosos para SQL injection
    if (/['"=;()\\]/.test(email)) {
      setError("El correo electrónico contiene caracteres no permitidos.");
      setLoading(false);
      return;
    }

    try {
      let plataforma = "";
      await new Promise((resolve) => setTimeout(resolve, 2000));

      if (Platform.OS === "web") {
        plataforma = "web";
        console.log("Está restableciendo desde la web", plataforma);
      } else {
        plataforma = "movil";
        console.log("Está restableciendo desde la app móvil", plataforma);
      }

      await enviarEmailRecuperacion(email, plataforma);

      setMensaje(
        "Si el correo está registrado, recibirás un enlace para restablecer la contraseña."
      );
    } catch (err) {
      console.error(err);
      setError("Hubo un problema al intentar enviar el correo.");
      setLoading(false);
    } finally {
      setLoading(false); // ocultar spinner
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ImageBackground
        source={require("../assets/images/fondo3.jpg")}
        style={styles(isDark).backgroundImage}
      >
        <ScrollView
          contentContainerStyle={styles(isDark).wrapper}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles(isDark).formContainer}>
            <Text style={styles(isDark).title}>Recuperar contraseña</Text>

            <TextInput
              style={styles(isDark).input}
              placeholder="Ingresá tu correo electrónico"
              placeholderTextColor={isDark ? "#ccc" : "#888"}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setLoading(false); // Oculta el spinner y habilita el botón al escribir
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {error !== "" && <Text style={styles(isDark).error}>{error}</Text>}
            {mensaje !== "" && (
              <Text style={styles(isDark).mensaje}>{mensaje}</Text>
            )}

            <Pressable
              style={styles(isDark).button}
              onPress={handleRecuperar}
              disabled={loading} // desactivar botón mientras carga
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles(isDark).buttonText}>Enviar</Text>
              )}
            </Pressable>

            <Text style={styles(isDark).volverLink}>
              ¿Ya recordaste tu contraseña?{" "}
              <Text
                style={styles(isDark).linkText}
                onPress={() => router.replace("/login")}
              >
                Iniciar sesión
              </Text>
            </Text>
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
      //backgroundColor: isDark ? '#000' : '#fff',
      paddingHorizontal: 20,
    },
    formContainer: {
      width: "100%",
      maxWidth: 360,
      backgroundColor: isDark ? "rgba(17,17,17,0.9)" : "rgba(242,242,242,0.9)",
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
    volverLink: {
      marginTop: 20,
      textAlign: "center",
      color: isDark ? "#aaa" : "#444",
    },
    linkText: {
      color: "#007AFF",
      fontWeight: "bold",
    },
    backgroundImage: {
      flex: 1,
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
  });
