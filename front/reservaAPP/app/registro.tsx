import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  useColorScheme,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { registrarUsuario } from "../services/authService";
import { Ionicons } from "@expo/vector-icons";

// Definir el tipo para los errores
type Errores = {
  nombre?: string;
  apellido?: string;
  dni?: string;
  telefono?: string;
  email?: string;
  usuario?: string;
  contrasenia?: string;
};

export default function RegistroScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [usuario, setUsuario] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [errores, setErrores] = useState<Errores>({}); // Especificar el tipo de errores
  const [cargando, setCargando] = useState(false);
  const [showPasswordInfo, setShowPasswordInfo] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isDark = colorScheme === "dark";

  const handleRegistro = async () => {
    console.log("Registrando usuario:", {
      nombre,
      apellido,
      dni,
      telefono,
      email,
      usuario,
      contrasenia,
    });
    const payload = {
      nombre,
      apellido,
      dni,
      telefono,
      email,
      usuario,
      contrasenia,
    };

    setCargando(true);
    try {
      const response = await registrarUsuario(payload);
      Alert.alert(
        "Verificación requerida",
        "Te enviamos un correo con un enlace para verificar tu cuenta. Revisá tu bandeja de entrada (y también la de spam).",
        [
          {
            text: "OK",
            onPress: () => router.replace("/login"),
          },
        ]
      );
      setErrores({});
      router.replace("/login");
    } catch (error: any) {
      if (Array.isArray(error.errors)) {
        // Convertimos el array de errores en un objeto { campo: mensaje }
        const erroresFormateados: Errores = {};
        error.errors.forEach((err: any) => {
          erroresFormateados[err.path as keyof Errores] = err.msg;
        });
        setErrores(erroresFormateados);
      } else if (error.mensaje) {
        Alert.alert("Error", error.mensaje);
      } else {
        Alert.alert("Error", "Ocurrió un error inesperado");
      }
    } finally {
      setCargando(false);
    }
  };

  const styles = StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      justifyContent: "center",
      alignItems: "center",
      // backgroundColor: isDark ? '#000' : '#fff',
      paddingHorizontal: 20,
      paddingVertical: 40, // para espacio arriba/abajo
    },
    formContainer: {
      width: "100%",
      maxWidth: 380,
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
      transform: [{ scale: 1 }],
      transitionDuration: "200ms",
    },
    buttonText: {
      color: "#fff",
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 0.5,
    },
    volverLogin: {
      marginTop: 16,
      textAlign: "center",
      color: isDark ? "#aaa" : "#444",
    },
    volverLink: {
      color: "#007AFF",
      fontWeight: "bold",
    },
    errorText: {
      color: "red",
      fontSize: 12,
      marginTop: 5,
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
     modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 350,
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
    color: "#007AFF",
  },
  closeButton: {
    marginTop: 15,
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 8,
  },
   text: {
    
    color: "#fff",
  },
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <ImageBackground
        source={require("../assets/images/fondo3.jpg")}
        style={styles.backgroundImage}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formContainer}>
            <Text style={styles.title}>Registrarse</Text>

            {errores.nombre && (
              <Text style={styles.errorText}>{errores.nombre}</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? "#fff" : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                },
              ]}
              placeholder="Nombre"
              placeholderTextColor={isDark ? "#ccc" : "#888"}
              value={nombre}
              onChangeText={(text) => {
                setNombre(text);
                setErrores((prev) => ({ ...prev, nombre: "" }));
              }}
            />

            {errores.apellido && (
              <Text style={styles.errorText}>{errores.apellido}</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? "#fff" : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                },
              ]}
              placeholder="Apellido"
              placeholderTextColor={isDark ? "#ccc" : "#888"}
              value={apellido}
              onChangeText={(text) => {
                setApellido(text);
                setErrores((prev) => ({ ...prev, apellido: "" }));
              }}
            />

            {errores.dni && <Text style={styles.errorText}>{errores.dni}</Text>}
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? "#fff" : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                },
              ]}
              placeholder="DNI"
              placeholderTextColor={isDark ? "#ccc" : "#888"}
              value={dni}
              onChangeText={(text) => {
                setDni(text);
                setErrores((prev) => ({ ...prev, dni: "" }));
              }}
            />

            {errores.telefono && (
              <Text style={styles.errorText}>{errores.telefono}</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? "#fff" : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                },
              ]}
              placeholder="Telefono"
              placeholderTextColor={isDark ? "#ccc" : "#888"}
              value={telefono}
              onChangeText={(text) => {
                setTelefono(text);
                setErrores((prev) => ({ ...prev, telefono: "" }));
              }}
            />

            {errores.email && (
              <Text style={styles.errorText}>{errores.email}</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? "#fff" : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                },
              ]}
              placeholder="Email"
              placeholderTextColor={isDark ? "#ccc" : "#888"}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrores((prev) => ({ ...prev, email: "" }));
              }}
            />

            {errores.usuario && (
              <Text style={styles.errorText}>{errores.usuario}</Text>
            )}
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? "#fff" : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                },
              ]}
              placeholder="Usuario"
              placeholderTextColor={isDark ? "#ccc" : "#888"}
              value={usuario}
              onChangeText={(text) => {
                setUsuario(text);
                setErrores((prev) => ({ ...prev, usuario: "" }));
              }}
            />

            {errores.contrasenia && (
              <Text style={styles.errorText}>{errores.contrasenia}</Text>
            )}
          <View style={{ position: "relative" }}>
            <TextInput
              style={[
                styles.input,
                {
                  color: isDark ? "#fff" : "#000",
                  backgroundColor: isDark ? "#1a1a1a" : "#fff",
                  paddingRight: 80, // espacio para que no se tape el texto con los íconos
                },
              ]}
              placeholder="Contraseña"
              placeholderTextColor={isDark ? "#ccc" : "#888"}
              secureTextEntry={!showPassword} // acá controlás si se ve o no
              value={contrasenia}
              onChangeText={(text) => setContrasenia(text)}
            />

            {/* Ícono para ver/ocultar contraseña */}
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              style={{ position: "absolute", right: 40, top: "30%" }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#555"
              />
            </Pressable>

            {/* Ícono de info */}
            <Pressable
              onPress={() => setShowPasswordInfo(true)}
              style={{ position: "absolute", right: 10, top: "30%" }}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color="#007AFF"
              />
            </Pressable>
          </View>

               <Modal
            visible={showPasswordInfo}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPasswordInfo(false)}
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor:  "#333"},
                ]}
              >
                <Text style={styles.modalTitle}>Condiciones de la contraseña:</Text>
                <Text style={styles.text}>- Mínimo 8 caracteres</Text>
                <Text style={styles.text}>- Máximo 12 caracteres</Text>
                <Text style={styles.text}>- Al menos una letra mayúscula</Text>
                <Text style={styles.text}>- Al menos una letra minúscula</Text>
                <Text style={styles.text}>- Al menos un número</Text>
                <Text style={styles.text}>- Al menos un carácter especial</Text>

                <Pressable
                  onPress={() => setShowPasswordInfo(false)}
                  style={styles.closeButton}
                >
                  <Text style={{ color: "#fff", textAlign: "center" }}>Cerrar</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
           <Pressable
              style={styles.button}
              onPress={handleRegistro}
              disabled={cargando}
            >
              {cargando ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Registrar</Text>
              )}
          </Pressable>
            <Text style={styles.volverLogin}>
              ¿Ya tenés cuenta?{" "}
              <Text
                style={styles.volverLink}
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
