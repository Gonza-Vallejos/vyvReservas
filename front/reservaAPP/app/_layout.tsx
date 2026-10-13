import React, { useEffect, useRef } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import {
  View,
  Animated,
  Pressable,
  StyleSheet,
  useColorScheme,
  ImageBackground,
} from "react-native";
import { AuthProvider } from "../context/AuthContext";
import BackButton from "@/components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const pathname = usePathname();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const esPrincipal =
    pathname === "/login" ||
    pathname === "/registro" ||
    pathname === "/recuperarContrasenia" ||
    pathname === "/resetear/[token]";

  const esPantallaSecundaria = pathname.startsWith("/pantallas/");

  const titulosPorRuta: Record<string, string> = {
    "/choferReserva": "Reservas",
    "/choferViajes": "Viajes",
    "/crearEmpresa": "Crear Empresa",
    "/empresaUsuarios": "Empleados",
    "/listarEmpresas": "Empresas",
    "/listarReservas": "Reservas",
    "/listarTransportes": "Transportes",
    "/listarViajes": "Viajes",
    "/perfil": "Mi perfil",
    "/reserva": "Mis Reservas",
    "/usuarios": "Usuarios",
    "/viajes": "Buscar Viajes",
    "/pantallas/actualizarContrasenia": "Actualizar Contraseña",
    "/pantallas/choferListaPasajeros": "Lista de Pasajeros",
    "/pantallas/confirmarReserva": "Lista de Reservas",
    "/pantallas/crearTransporte": "Crear Transporte",
    "/pantallas/crearViaje": "Crear Nuevo Viaje",
    "/pantallas/detalleReserva": "Detalle de reserva",
    "/pantallas/detalleVenta": "Detalle de la Venta",
    "/pantallas/editarTransporte": "Modificar Transporte",
    "/pantallas/editarViaje": "Modificar Viaje",
    "/pantallas/listarReservasPorViaje": "Reservas del Viaje",
    "/pantallas/modificarEmpresa": "Modificar Empresa",
    "/pantallas/modificarPasajero": "Modificar Pasajero",
    "/pantallas/modificarUsuario": "Modificar Usuario",
    "/pantallas/realizarReserva": "Nueva reserva",
    "/pantallas/ventaReserva": "Nueva venta",
    "/pantallas/reportes/reportesLista": "Reportes",
  };

  const tituloHeader = titulosPorRuta[pathname] || "V&V Reservas";

  useEffect(() => {
    fadeAnim.setValue(1);
  }, [tituloHeader]);

  return (
    <AuthProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor="transparent"
        />

        {/* Imagen de fondo */}
        <ImageBackground
          source={require("../assets/images/fondo3.jpg")} // coloca tu imagen aquí
          style={styles.background}
          resizeMode="cover"
        >
          <View style={styles.overlay} />{" "}
          {/* Oscurece un poco la imagen para mejorar el contraste */}
          {!esPrincipal && (
            <>
              <LinearGradient
                colors={["#1e3a8a", "#2563eb"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
              >
                <View style={styles.side} />
                <View style={styles.center}>
                  <Animated.Text
                    style={[styles.title, { opacity: fadeAnim }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {tituloHeader}
                  </Animated.Text>
                </View>
                <View style={styles.side}>
                  <Pressable
                    onPress={() => router.push("/perfil")}
                    style={styles.profileBtn}
                  >
                    <Ionicons
                      name="person-circle-outline"
                      size={28}
                      color="#fff"
                    />
                  </Pressable>
                </View>
              </LinearGradient>

              {esPantallaSecundaria && (
                <View style={styles.backFloating}>
                  <BackButton />
                </View>
              )}
            </>
          )}
          <View style={styles.content}>
            <Slot />
          </View>
        </ImageBackground>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1e3a8a",
  },
  background: {
    flex: 1,
    position: "relative",
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.65)", // elegante tinte oscuro slate
  },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.12)",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  side: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  profileBtn: {
    padding: 4,
    borderRadius: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    padding: 0,
  },
  backFloating: {
    position: "absolute",
    top: 22,
    left: 10,
    zIndex: 999,
  },
});
