import React, { useEffect, useRef } from "react";
import { Slot, usePathname, useRouter } from "expo-router";
import {
  View,
  Animated,
  Pressable,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { AuthProvider } from "../context/AuthContext";
import BackButton from "@/components/BackButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/Colors";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const pathname = usePathname();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const theme = Colors[isDark ? "dark" : "light"];

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
    "/pantallas/confirmarReserva": "Confirmación",
    "/pantallas/crearTransporte": "Crear Transporte",
    "/pantallas/crearViaje": "Crear Nuevo Viaje",
    "/pantallas/detalleReserva": "Detalle de reserva",
    "/pantallas/detalleVenta": "Detalle de la Venta",
    "/pantallas/detalleViaje": "Detalle del viaje",
    "/pantallas/editarTransporte": "Modificar Transporte",
    "/pantallas/editarViaje": "Modificar Viaje",
    "/pantallas/listarReservasPorViaje": "Reservas del Viaje",
    "/pantallas/modificarEmpresa": "Modificar Empresa",
    "/pantallas/modificarPasajero": "Modificar Pasajero",
    "/pantallas/modificarUsuario": "Modificar Usuario",
    "/pantallas/pagoExitoso": "Pago confirmado",
    "/pantallas/pagoFallido": "Pago no completado",
    "/pantallas/realizarReserva": "Nueva reserva",
    "/pantallas/seleccionarAsientos": "Seleccionar asientos",
    "/pantallas/ventaReserva": "Nueva venta",
    "/pantallas/reportes/reportesLista": "Reportes",
  };

  const tituloHeader = titulosPorRuta[pathname] || "V&V Reservas";

  useEffect(() => {
    fadeAnim.setValue(1);
  }, [tituloHeader]);

  return (
    <AuthProvider>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
        edges={["top", "left", "right"]}
      >
        <StatusBar
          style={isDark ? "light" : "dark"}
          backgroundColor="transparent"
        />

        <View style={[styles.background, { backgroundColor: theme.background }]}>
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
                    allowFontScaling
                  >
                    {tituloHeader}
                  </Animated.Text>
                </View>
                <View style={styles.side}>
                  <Pressable
                    onPress={() => router.push("/perfil")}
                    style={styles.profileBtn}
                    accessibilityLabel="Ir a mi perfil"
                    accessibilityRole="button"
                    hitSlop={8}
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
        </View>
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  background: {
    flex: 1,
    position: "relative",
    width: "100%",
    height: "100%",
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
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
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
