import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  ActivityIndicator,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { loginUsuario } from "../services/authService";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

export default function LoginScreen({
  onLoginSuccess,
}: {
  onLoginSuccess?: () => void;
}) {
  const { login } = useAuth();
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [contrasenia, setPassword] = useState("");
  const [errorMensaje, setErrorMensaje] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);
  const frases = [
    "Tu viaje comienza aquí",
    "Reservá rápido",
    "Viajá seguro",
    "Comodidad garantizada",
  ];

  const [displayText, setDisplayText] = useState("");
  const [fraseIndex, setFraseIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timeout;

    if (charIndex < frases[fraseIndex].length) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + frases[fraseIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 100);
    } else {
      // espera 2 segundos antes de borrar y pasar a la siguiente
      timeout = setTimeout(() => {
        setDisplayText("");
        setCharIndex(0);
        setFraseIndex((prev) => (prev + 1) % frases.length);
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [charIndex, fraseIndex]);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const { token } = await loginUsuario(usuario, contrasenia);
      await login(token);
      await AsyncStorage.setItem("token", token);

      if (onLoginSuccess) {
        onLoginSuccess();
      }

      router.replace("/(tabs)");
    } catch (error: any) {
      console.error(
        "Error al iniciar sesión:",
        error.response?.data || error.message
      );
      const mensaje =
        error.response?.data?.mensaje || "Usuario o contraseña incorrectos";
      setErrorMensaje(mensaje);
      setLoading(false);
    } finally {
      setLoading(false); // ocultar spinner
    }
  };

  const handleUsuarioChange = (text: string) => {
    setUsuario(text);
    if (errorMensaje !== "") setErrorMensaje("");
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMensaje !== "") setErrorMensaje("");
  };

  const isDark = colorScheme === "dark";

  const styles = StyleSheet.create({
    wrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
    },
    containerWeb: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
    },
    sideImageContainer: {
      flex: 1,
      paddingRight: 20,
    },
    sideImage: {
      width: "100%",
      height: 400,
      resizeMode: "cover",
      borderRadius: 12,
    },
    formWrapper: {
      flex: 1,
      alignItems: "center",
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
      fontSize: 24,
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
      marginBottom: 14,
      paddingHorizontal: 12,
      color: isDark ? "#fff" : "#000",
      backgroundColor: isDark ? "#1a1a1a" : "#fff",
    },
    button: {
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
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    registroLink: {
      marginTop: 16,
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
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.3)",
    },
    sideTextContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: "rgba(0,0,0,0.1)", // fondo sutil translúcido
      borderRadius: 16,
    },
    sideText: {
      fontSize: 22,
      fontWeight: "600",
      textAlign: "center",
      color: "#00E5FF",
      letterSpacing: 1,
      textShadowColor: "rgba(0,229,255,0.4)",
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 4,
    },
    icon: {
      width: 90,
      height: 90,
      marginBottom: 15,
      tintColor: "#00C4FF",
    },
    titulo: {
      fontSize: 34,
      fontWeight: "900",
      color: "#fff",
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 10,
      textShadowColor: "rgba(0,0,0,0.6)", // efecto glow
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 6,
    },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 50 : 0}
    >
      <ImageBackground
        source={require("../assets/images/fondo3.jpg")}
        style={styles.backgroundImage}
      >
        <View style={styles.overlay} />

        {Platform.OS === "web" ? (
          <View style={styles.containerWeb}>
            {/*Texto animado en lugar de la imagen */}
            <View style={styles.sideTextContainer}>
              <Animatable.Image
                animation="swing"
                iterationCount="infinite"
                source={require("../assets/images/bus-icon.png")}
                style={styles.icon}
              /> 
              <Text style={styles.titulo}>V&V Reservas</Text>
              <Animatable.Text
                animation="pulse"
                iterationCount="infinite"
                duration={1200}
                style={styles.sideText}
              >
                {displayText}...
                
              </Animatable.Text>
            </View>

            {/* Formulario */}
            <View style={styles.formWrapper}>
              <View style={styles.formContainer}>
                <Text style={styles.title}>Iniciar sesión</Text>

                <TextInput
                  style={styles.input}
                  placeholder="Usuario"
                  placeholderTextColor={isDark ? "#ccc" : "#888"}
                  value={usuario}
                  onChangeText={handleUsuarioChange}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordInputRef.current?.focus()}
                />

                <View style={{ position: "relative" }}>
                  <TextInput
                    ref={passwordInputRef}
                    style={[styles.input, { paddingRight: 40 }]}
                    placeholder="Contraseña"
                    placeholderTextColor={isDark ? "#ccc" : "#888"}
                    secureTextEntry={!mostrarPassword}
                    value={contrasenia}
                    onChangeText={handlePasswordChange}
                    onSubmitEditing={handleLogin}
                    returnKeyType="done"
                  />

                  <Pressable
                    onPress={() => setMostrarPassword(!mostrarPassword)}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: 12,
                    }}
                  >
                    <Ionicons
                      name={mostrarPassword ? "eye-off-outline" : "eye-outline"}
                      size={22}
                      color={"#555"}
                    />
                  </Pressable>
                </View>

                {errorMensaje !== "" && (
                  <Text
                    style={{
                      color: "red",
                      marginBottom: 10,
                      textAlign: "center",
                    }}
                  >
                    {errorMensaje}
                  </Text>
                )}

                <Pressable
                  style={styles.button}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Ingresar</Text>
                  )}
                </Pressable>

                <Text style={styles.registroLink}>
                  ¿No tenés cuenta? {" "}
                  <Text
                    style={styles.linkText}
                    onPress={() => router.push("/registro")}
                  >
                    Registrarse
                  </Text>
                </Text>

                <Text
                  style={[styles.registroLink, { marginTop: 12 }]}
                  onPress={() => router.push("/recuperarContrasenia")}
                >
                  ¿Olvidaste tu contraseña?
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.wrapper}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.formContainer}>
              <Text style={styles.title}>Iniciar sesión</Text>

              <TextInput
                style={styles.input}
                placeholder="Usuario"
                placeholderTextColor={isDark ? "#ccc" : "#888"}
                value={usuario}
                onChangeText={handleUsuarioChange}
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
              />

              <View style={{ position: "relative" }}>
                <TextInput
                  ref={passwordInputRef}
                  style={[styles.input, { paddingRight: 40 }]}
                  placeholder="Contraseña"
                  placeholderTextColor={isDark ? "#ccc" : "#888"}
                  secureTextEntry={!mostrarPassword}
                  value={contrasenia}
                  onChangeText={handlePasswordChange}
                  onSubmitEditing={handleLogin}
                  returnKeyType="done"
                />
                <Pressable
                  onPress={() => setMostrarPassword(!mostrarPassword)}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: 12,
                  }}
                >
                  <Ionicons
                    name={mostrarPassword ? "eye-off" : "eye"}
                    size={22}
                    color={isDark ? "#ccc" : "#555"}
                  />
                </Pressable>
              </View>

              {errorMensaje !== "" && (
                <Text
                  style={{
                    color: "red",
                    marginBottom: 10,
                    textAlign: "center",
                  }}
                >
                  {errorMensaje}
                </Text>
              )}

              <Pressable style={styles.button} onPress={handleLogin}>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Ingresar</Text>
                )}
              </Pressable>

              <Text style={styles.registroLink}>
                ¿No tenés cuenta?{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => router.push("/registro")}
                >
                  Registrarse
                </Text>
              </Text>
              <Text
                style={[styles.registroLink, { marginTop: 12 }]}
                onPress={() => router.push("/recuperarContrasenia")}
              >
                ¿Olvidaste tu contraseña?
              </Text>
            </View>
          </ScrollView>
        )}
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}
