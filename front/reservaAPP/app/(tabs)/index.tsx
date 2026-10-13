import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";

export default function Index() {
  const { isLoggedIn, isLoading, userInfo } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
      </View>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const getPerfilLabel = (perfil?: string) => {
    switch (perfil) {
      case "usuarioEmpresa":
        return { label: "Empresa", icon: "business" as const, color: "#38bdf8" };
      case "usuarioChofer":
        return { label: "Chofer", icon: "car" as const, color: "#10b981" };
      case "usuarioMostrador":
        return { label: "Mostrador", icon: "desktop" as const, color: "#a855f7" };
      case "usuarioAdministrador":
        return { label: "Administrador", icon: "shield-checkmark" as const, color: "#f59e0b" };
      default:
        return { label: "Pasajero", icon: "person" as const, color: "#60a5fa" };
    }
  };

  const perfilInfo = getPerfilLabel(userInfo?.perfil);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Welcome */}
      <Animatable.View animation="fadeInDown" duration={800} style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Animatable.Image
            animation="pulse"
            iterationCount="infinite"
            duration={2500}
            source={require("../../assets/images/bus-icon.png")}
            style={styles.heroIcon}
          />
          <View style={styles.heroTextContainer}>
            <Text style={styles.greeting}>
              ¡Hola, {userInfo?.nombre || userInfo?.usuario || "Bienvenido"}!
            </Text>
            <Text style={styles.brandSubtitle}>V&V Reservas</Text>
          </View>
        </View>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { borderColor: perfilInfo.color }]}>
            <Ionicons name={perfilInfo.icon} size={14} color={perfilInfo.color} style={{ marginRight: 6 }} />
            <Text style={[styles.badgeText, { color: perfilInfo.color }]}>
              {perfilInfo.label}
            </Text>
          </View>
          <Text style={styles.travelText}>Tu viaje comienza aquí</Text>
        </View>
      </Animatable.View>

      {/* Acciones principales según perfil */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Accesos Rápidos</Text>
      </View>

      <Animatable.View animation="fadeInUp" duration={900} delay={200} style={styles.actionsContainer}>
        {/* Acciones Cliente */}
        {userInfo?.perfil === "usuarioCliente" && (
          <>
            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/viajes")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#2563eb20" }]}>
                <Ionicons name="search" size={24} color="#38bdf8" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Buscar Viajes</Text>
                <Text style={styles.actionDesc}>Encontrá salidas y reservá tus asientos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/reserva")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#10b98120" }]}>
                <Ionicons name="calendar-outline" size={24} color="#34d399" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Mis Reservas</Text>
                <Text style={styles.actionDesc}>Revisá el estado y tus pasajes emitidos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>
          </>
        )}

        {/* Acciones Empresa */}
        {userInfo?.perfil === "usuarioEmpresa" && (
          <>
            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/pantallas/reportes/reportesLista")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#f59e0b20" }]}>
                <Ionicons name="stats-chart" size={24} color="#fbbf24" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Reportes y Métricas</Text>
                <Text style={styles.actionDesc}>Ganancias, ocupación y ventas de pasajes</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/listarViajes")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#2563eb20" }]}>
                <Ionicons name="trail-sign-outline" size={24} color="#38bdf8" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Gestionar Viajes</Text>
                <Text style={styles.actionDesc}>Control de salidas y horarios de la flota</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/listarTransportes")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#10b98120" }]}>
                <Ionicons name="bus-outline" size={24} color="#34d399" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Minibuses y Unidades</Text>
                <Text style={styles.actionDesc}>Flota activa y capacidades de asientos</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/empresaUsuarios")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#8b5cf620" }]}>
                <Ionicons name="people-outline" size={24} color="#a78bfa" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Choferes y Empleados</Text>
                <Text style={styles.actionDesc}>Gestión de personal de la empresa</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>
          </>
        )}

        {/* Acciones Chofer */}
        {userInfo?.perfil === "usuarioChofer" && (
          <>
            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/choferViajes")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#2563eb20" }]}>
                <Ionicons name="trail-sign-outline" size={24} color="#38bdf8" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Mis Viajes Asignados</Text>
                <Text style={styles.actionDesc}>Horarios, rutas y salidas de hoy</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/choferReserva")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#10b98120" }]}>
                <Ionicons name="reader-outline" size={24} color="#34d399" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Lista de Reservas</Text>
                <Text style={styles.actionDesc}>Planilla de pasajeros confirmados</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>
          </>
        )}

        {/* Acciones Mostrador */}
        {userInfo?.perfil === "usuarioMostrador" && (
          <>
            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/pantallas/crearViaje")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#2563eb20" }]}>
                <Ionicons name="add-circle-outline" size={24} color="#38bdf8" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Crear Nuevo Viaje</Text>
                <Text style={styles.actionDesc}>Programar horarios y tarifas</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/listarReservas")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#10b98120" }]}>
                <Ionicons name="clipboard-outline" size={24} color="#34d399" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Control de Reservas</Text>
                <Text style={styles.actionDesc}>Emisión y cobro en boletería</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>
          </>
        )}

        {/* Acciones Administrador */}
        {userInfo?.perfil === "usuarioAdministrador" && (
          <>
            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/crearEmpresa")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#2563eb20" }]}>
                <Ionicons name="business-outline" size={24} color="#38bdf8" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Nueva Empresa</Text>
                <Text style={styles.actionDesc}>Alta y configuración de prestadores</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/listarEmpresas")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#f59e0b20" }]}>
                <Ionicons name="list-outline" size={24} color="#fbbf24" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Ver Empresas</Text>
                <Text style={styles.actionDesc}>Supervisar empresas registradas</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
              onPress={() => router.push("/(tabs)/usuarios")}
            >
              <View style={[styles.iconCircle, { backgroundColor: "#8b5cf620" }]}>
                <Ionicons name="people-outline" size={24} color="#a78bfa" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Gestión de Usuarios</Text>
                <Text style={styles.actionDesc}>Permisos y cuentas del sistema</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </Pressable>
          </>
        )}

        {/* Acceso a perfil común */}
        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
          onPress={() => router.push("/(tabs)/perfil")}
        >
          <View style={[styles.iconCircle, { backgroundColor: "#64748b20" }]}>
            <Ionicons name="person-circle-outline" size={24} color="#94a3b8" />
          </View>
          <View style={styles.actionInfo}>
            <Text style={styles.actionTitle}>Mi Cuenta</Text>
            <Text style={styles.actionDesc}>Datos de perfil y configuración</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
        </Pressable>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: "rgba(30, 41, 59, 0.85)",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  heroIcon: {
    width: 52,
    height: 52,
    marginRight: 14,
    tintColor: "#38bdf8",
  },
  heroTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: 0.3,
  },
  brandSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#94a3b8",
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    paddingTop: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  travelText: {
    fontSize: 12,
    color: "#cbd5e1",
    fontStyle: "italic",
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#f8fafc",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  actionsContainer: {
    gap: 10,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.88)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  actionCardPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.985 }],
    backgroundColor: "rgba(51, 65, 85, 0.95)",
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: "#94a3b8",
  },
});
