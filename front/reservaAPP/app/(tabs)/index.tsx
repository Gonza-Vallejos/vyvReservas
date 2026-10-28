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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useThemeColor } from "@/components/Themed";
import SearchForm from "@/components/ui/SearchForm";
import Card from "@/components/ui/Card";

export default function Index() {
  const { isLoggedIn, isLoading, userInfo } = useAuth();
  const router = useRouter();
  const reducedMotion = useReducedMotion();

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const surface = useThemeColor({}, "surface");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");
  const border = useThemeColor({}, "border");
  const primary = useThemeColor({}, "primary");

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor: useThemeColor({}, "background") }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const isCliente =
    !userInfo?.perfil ||
    userInfo?.perfil === "usuarioCliente" ||
    userInfo?.perfil === "cliente" ||
    userInfo?.perfil_id === 2;

  const getPerfilLabel = (perfil?: string) => {
    switch (perfil) {
      case "usuarioEmpresa":
        return { label: "Empresa", icon: "business" as const, color: "#3B82F6" };
      case "usuarioChofer":
        return { label: "Chofer", icon: "car" as const, color: "#10B981" };
      case "usuarioMostrador":
        return { label: "Mostrador", icon: "desktop" as const, color: "#8B5CF6" };
      case "usuarioAdministrador":
        return { label: "Administrador", icon: "shield-checkmark" as const, color: "#F59E0B" };
      default:
        return { label: "Pasajero", icon: "person" as const, color: "#60A5FA" };
    }
  };

  const perfilInfo = getPerfilLabel(userInfo?.perfil);

  const handleSearch = (params: { origen: string; destino: string; fecha: string }) => {
    router.push({
      pathname: "/(tabs)/viajes",
      params: {
        origen: params.origen,
        destino: params.destino,
        fecha: params.fecha,
      },
    });
  };

  const QuickAction = ({
    icon,
    title,
    description,
    onPress,
    color,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    description: string;
    onPress: () => void;
    color: string;
  }) => (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        {
          backgroundColor: surface,
          borderColor: border,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.actionInfo}>
        <Text allowFontScaling style={[styles.actionTitle, { color: text }]}>
          {title}
        </Text>
        <Text
          allowFontScaling
          style={[styles.actionDesc, { color: textSecondary }]}
        >
          {description}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={textMuted} />
    </Pressable>
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: useThemeColor({}, "background") }]}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Welcome */}
      <LinearGradient
        colors={["#1e3a8a", "#2563eb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.heroCard}
      >
        <Animatable.View
          animation={reducedMotion ? undefined : "fadeInDown"}
          duration={reducedMotion ? 0 : 600}
        >
          <View style={styles.heroKicker}>
            <Text style={styles.heroKickerText} allowFontScaling>
              🚍 Viajá seguro, viajá feliz
            </Text>
          </View>

          <View style={styles.heroHeader}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="bus" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.heroTextContainer}>
              <Text style={styles.greeting} allowFontScaling>
                ¡Hola, {userInfo?.nombre || userInfo?.usuario || "Bienvenido"}!
              </Text>
              <Text style={styles.heroSubtitle} allowFontScaling>
                Reservá tu próximo viaje en un clic.
              </Text>
            </View>
          </View>

          <View style={styles.badgeRow}>
            <View
              style={[
                styles.badge,
                { borderColor: perfilInfo.color, backgroundColor: "rgba(15,23,42,0.35)" },
              ]}
            >
              <Ionicons
                name={perfilInfo.icon}
                size={14}
                color={perfilInfo.color}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.badgeText, { color: "#FFFFFF" }]} allowFontScaling>
                {perfilInfo.label}
              </Text>
            </View>
            <Text style={styles.travelText} allowFontScaling>
              Tu viaje comienza aquí
            </Text>
          </View>
        </Animatable.View>
      </LinearGradient>

      {/* Búsqueda rápida (solo pasajero) */}
      {isCliente && (
        <Animatable.View
          animation={reducedMotion ? undefined : "fadeInUp"}
          duration={reducedMotion ? 0 : 600}
          delay={reducedMotion ? 0 : 100}
        >
          <Card style={styles.searchCard}>
            <Text
              allowFontScaling
              style={[styles.sectionTitle, { color: text }]}
            >
              ¿A dónde querés viajar?
            </Text>
            <SearchForm onSearch={handleSearch} />
          </Card>
        </Animatable.View>
      )}

      {/* Acciones principales según perfil */}
      <View style={styles.sectionHeader}>
        <Text
          allowFontScaling
          style={[styles.sectionHeaderTitle, { color: text }]}
        >
          Accesos Rápidos
        </Text>
      </View>

      <Animatable.View
        animation={reducedMotion ? undefined : "fadeInUp"}
        duration={reducedMotion ? 0 : 600}
        delay={reducedMotion ? 0 : 200}
        style={styles.actionsContainer}
      >
        {/* Acciones Cliente */}
        {isCliente && (
          <>
            <QuickAction
              icon="search"
              title="Buscar Viajes"
              description="Encontrá salidas y reservá tus asientos"
              onPress={() => router.push("/(tabs)/viajes")}
              color={primary}
            />
            <QuickAction
              icon="calendar-outline"
              title="Mis Reservas"
              description="Revisá el estado y tus pasajes emitidos"
              onPress={() => router.push("/(tabs)/reserva")}
              color="#10B981"
            />
          </>
        )}

        {/* Acciones Empresa */}
        {userInfo?.perfil === "usuarioEmpresa" && (
          <>
            <QuickAction
              icon="stats-chart"
              title="Reportes y Métricas"
              description="Ganancias, ocupación y ventas de pasajes"
              onPress={() => router.push("/pantallas/reportes/reportesLista")}
              color="#F59E0B"
            />
            <QuickAction
              icon="trail-sign-outline"
              title="Gestionar Viajes"
              description="Control de salidas y horarios de la flota"
              onPress={() => router.push("/(tabs)/listarViajes")}
              color={primary}
            />
            <QuickAction
              icon="bus-outline"
              title="Minibuses y Unidades"
              description="Flota activa y capacidades de asientos"
              onPress={() => router.push("/(tabs)/listarTransportes")}
              color="#10B981"
            />
            <QuickAction
              icon="people-outline"
              title="Choferes y Empleados"
              description="Gestión de personal de la empresa"
              onPress={() => router.push("/(tabs)/empresaUsuarios")}
              color="#8B5CF6"
            />
          </>
        )}

        {/* Acciones Chofer */}
        {userInfo?.perfil === "usuarioChofer" && (
          <>
            <QuickAction
              icon="trail-sign-outline"
              title="Mis Viajes Asignados"
              description="Horarios, rutas y salidas de hoy"
              onPress={() => router.push("/(tabs)/choferViajes")}
              color={primary}
            />
            <QuickAction
              icon="reader-outline"
              title="Lista de Reservas"
              description="Planilla de pasajeros confirmados"
              onPress={() => router.push("/(tabs)/choferReserva")}
              color="#10B981"
            />
          </>
        )}

        {/* Acciones Mostrador */}
        {userInfo?.perfil === "usuarioMostrador" && (
          <>
            <QuickAction
              icon="add-circle-outline"
              title="Crear Nuevo Viaje"
              description="Programar horarios y tarifas"
              onPress={() => router.push("/pantallas/crearViaje")}
              color={primary}
            />
            <QuickAction
              icon="clipboard-outline"
              title="Control de Reservas"
              description="Emisión y cobro en boletería"
              onPress={() => router.push("/(tabs)/listarReservas")}
              color="#10B981"
            />
          </>
        )}

        {/* Acciones Administrador */}
        {userInfo?.perfil === "usuarioAdministrador" && (
          <>
            <QuickAction
              icon="business-outline"
              title="Nueva Empresa"
              description="Alta y configuración de prestadores"
              onPress={() => router.push("/(tabs)/crearEmpresa")}
              color={primary}
            />
            <QuickAction
              icon="list-outline"
              title="Ver Empresas"
              description="Supervisar empresas registradas"
              onPress={() => router.push("/(tabs)/listarEmpresas")}
              color="#F59E0B"
            />
            <QuickAction
              icon="people-outline"
              title="Gestión de Usuarios"
              description="Permisos y cuentas del sistema"
              onPress={() => router.push("/(tabs)/usuarios")}
              color="#8B5CF6"
            />
          </>
        )}

        {/* Acceso a perfil común */}
        <QuickAction
          icon="person-circle-outline"
          title="Mi Cuenta"
          description="Datos de perfil y configuración"
          onPress={() => router.push("/(tabs)/perfil")}
          color="#64748B"
        />
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
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  heroHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  heroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  heroTextContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  heroKicker: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 12,
  },
  heroKickerText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.12)",
    paddingTop: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  travelText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
    fontStyle: "italic",
  },
  searchCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  actionsContainer: {
    gap: 10,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
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
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
});
