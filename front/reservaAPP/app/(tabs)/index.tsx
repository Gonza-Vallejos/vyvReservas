import React from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import Login from "../login";
import * as Animatable from "react-native-animatable";

const { width, height } = Dimensions.get("window");

export default function Index() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const { userInfo } = useAuth();
  const esEmpresa = userInfo?.perfil === "usuarioEmpresa";
  const esCliente = userInfo?.perfil === "usuarioCliente";

  //actualizacion a produccion
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => {}} />;
  }

  return (
    <ImageBackground
      source={require("../../assets/images/fondo3.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animatable.View
          animation="fadeInDown"
          duration={1200}
          delay={300}
          style={styles.content}
        >
          <Animatable.Image
            animation="bounceIn"
            duration={1500}
            source={require("../../assets/images/bus-icon.png")}
            style={styles.icon}
          />

          <Text style={styles.title}>V&V Reservas</Text>
          <Animatable.Text
            animation="fadeInUp"
            delay={600}
            duration={1000}
            style={styles.subtitle}
          >
            Tu viaje comienza aquí
          </Animatable.Text>

          <Animatable.View animation="zoomIn" delay={800} duration={1000}>
            {userInfo?.perfil === "usuarioEmpresa" && (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push("/pantallas/reportes/reportesLista")}
              >
                <Text style={styles.buttonText}>Ver reportes</Text>
              </Pressable>
            )}

            {userInfo?.perfil === "usuarioCliente" && (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push("/(tabs)/viajes")}
              >
                <Text style={styles.buttonText}>Reservar ahora</Text>
              </Pressable>
            )}
             {userInfo?.perfil === "usuarioAdministrador" && (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push("/(tabs)/crearEmpresa")}
              >
                <Text style={styles.buttonText}>Nueva Empresa</Text>
              </Pressable>
            )}
            {userInfo?.perfil === "usuarioMostrador" && (
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
                ]}
                onPress={() => router.push("/pantallas/crearViaje")}
              >
                <Text style={styles.buttonText}>Nuevo Viaje</Text>
              </Pressable>
            )}
          </Animatable.View>
        </Animatable.View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  /*background: {
    width: width,
    height: height,
    justifyContent: 'center',
    
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
   title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#ddd',
    marginBottom: 32,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
   */

  background: {
      flex: 1,
      width: "100%",
      height: "100%",
      resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
  },
  icon: {
    width: 80,
    height: 80,
    marginBottom: 20,
    tintColor: "#fff",
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "#dddddd",
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#00c2ff",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
