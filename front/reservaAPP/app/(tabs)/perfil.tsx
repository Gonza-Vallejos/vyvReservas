import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { actualizarUsuario, obtenerUsuarioPorId } from "../../services/usuarioService";
import { useThemeColor } from "@/components/Themed";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import InputField from "@/components/ui/InputField";
import Badge from "@/components/ui/Badge";

const roleLabel = (perfil?: string) => {
  switch (perfil) {
    case "usuarioEmpresa":
      return "Dueño";
    case "usuarioAdministrador":
      return "Super Administrador";
    case "usuarioMostrador":
      return "Mostrador";
    case "usuarioChofer":
      return "Chofer";
    default:
      return "Pasajero";
  }
};

const roleBadgeVariant = (perfil?: string) => {
  switch (perfil) {
    case "usuarioEmpresa":
    case "usuarioAdministrador":
      return "primary" as const;
    case "usuarioMostrador":
      return "accent" as const;
    case "usuarioChofer":
      return "warning" as const;
    default:
      return "success" as const;
  }
};

export default function PerfilScreen() {
  const router = useRouter();
  const { logout, userInfo, updateUserInfo, isLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingUser, setLoadingUser] = useState(false);

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const textMuted = useThemeColor({}, "textMuted");
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");
  const background = useThemeColor({}, "background");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");

  useEffect(() => {
    if (!userInfo?.id || isEditing) return;
    const load = async () => {
      setLoadingUser(true);
      try {
        const data = await obtenerUsuarioPorId(userInfo.id);
        const usuario = Array.isArray(data) ? data[0] : data;
        if (usuario) {
          updateUserInfo(usuario);
          setForm({
            nombre: usuario.nombre || "",
            apellido: usuario.apellido || "",
            dni: usuario.dni ? String(usuario.dni) : "",
            telefono: usuario.telefono || "",
          });
        }
      } catch (err) {
        console.warn("Error al refrescar usuario:", err);
      } finally {
        setLoadingUser(false);
      }
    };
    load();
  }, [userInfo?.id]);

  const startEditing = () => {
    setForm({
      nombre: userInfo?.nombre || "",
      apellido: userInfo?.apellido || "",
      dni: userInfo?.dni ? String(userInfo.dni) : "",
      telefono: userInfo?.telefono || "",
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleChange = (field: keyof typeof form) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.nombre.trim()) nextErrors.nombre = "Ingresá tu nombre";
    if (!form.apellido.trim()) nextErrors.apellido = "Ingresá tu apellido";
    if (!form.dni.trim()) nextErrors.dni = "Ingresá tu DNI";
    else if (form.dni.trim().length < 7) nextErrors.dni = "DNI inválido";
    if (!form.telefono.trim()) nextErrors.telefono = "Ingresá tu teléfono";
    else if (form.telefono.trim().replace(/\D/g, "").length < 10)
      nextErrors.telefono = "Teléfono inválido";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (!userInfo?.id) return;
    setSaving(true);
    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        dni: parseInt(form.dni.trim(), 10),
        telefono: form.telefono.trim(),
      };
      await actualizarUsuario(userInfo.id, payload);
      updateUserInfo({ ...payload, dni: String(payload.dni) });

      if (Platform.OS === "web") {
        window.alert("Datos guardados correctamente");
      } else {
        Alert.alert("Listo", "Datos guardados correctamente");
      }
      setIsEditing(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.errores?.[0]?.msg ||
        error?.response?.data?.message ||
        error?.response?.data?.mensaje ||
        "No se pudieron guardar los cambios";
      if (Platform.OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("Error", message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      nombre: userInfo?.nombre || "",
      apellido: userInfo?.apellido || "",
      dni: userInfo?.dni ? String(userInfo.dni) : "",
      telefono: userInfo?.telefono || "",
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // El redirect a /login lo maneja TabLayout cuando isLoggedIn pasa a false.
    } catch (err) {
      console.warn("Error al cerrar sesión:", err);
    }
  };

  const handlePassword = () => {
    router.push({
      pathname: "/pantallas/actualizarContrasenia",
      params: { id: userInfo?.id },
    });
  };

  const handleHelp = () => {
    Linking?.openURL("mailto:ayuda@vyvreservas.com?subject=Consulta%20desde%20la%20app");
  };

  if (isLoading || loadingUser) {
    return (
      <View style={[styles.loader, { backgroundColor: background }]}>
        <ActivityIndicator size="large" color={primary} />
      </View>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        style={[styles.scroll, { backgroundColor: background }]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={[styles.avatarCircle, { backgroundColor: `${primary}12` }]}>
            <Ionicons name="person" size={36} color={primary} />
          </View>
          <View style={styles.headerText}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: text }]} allowFontScaling>
                {userInfo?.nombre || "Usuario"} {userInfo?.apellido || ""}
              </Text>
              <Badge variant={roleBadgeVariant(userInfo?.perfil)}>
                {roleLabel(userInfo?.perfil)}
              </Badge>
            </View>
            <Text style={[styles.email, { color: textSecondary }]} allowFontScaling>
              {userInfo?.email || "Correo no disponible"}
            </Text>
          </View>
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="person-outline" size={20} color={primary} />
              <Text style={[styles.cardTitle, { color: text }]} allowFontScaling>
                Datos personales
              </Text>
            </View>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onPress={startEditing} icon="create-outline">
                Editar
              </Button>
            ) : (
              <View style={styles.cardActions}>
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={handleCancelEdit}
                  icon="close-outline"
                  accessibilityLabel="Cancelar edición"
                >
                  {" "}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  loading={saving}
                  disabled={saving}
                  onPress={handleSave}
                  icon="save-outline"
                >
                  Guardar
                </Button>
              </View>
            )}
          </View>

          <InputField
            label="Nombre"
            value={isEditing ? form.nombre : userInfo?.nombre || ""}
            onChangeText={handleChange("nombre")}
            editable={isEditing && !saving}
            error={errors.nombre}
            icon="person-outline"
          />
          <InputField
            label="Apellido"
            value={isEditing ? form.apellido : userInfo?.apellido || ""}
            onChangeText={handleChange("apellido")}
            editable={isEditing && !saving}
            error={errors.apellido}
            icon="person-outline"
          />
          <InputField
            label="DNI"
            value={isEditing ? form.dni : userInfo?.dni ? String(userInfo.dni) : ""}
            onChangeText={(value) => handleChange("dni")(value.replace(/\D/g, ""))}
            editable={isEditing && !saving}
            error={errors.dni}
            icon="card-outline"
            keyboardType="numeric"
          />
          <InputField
            label="Teléfono"
            value={isEditing ? form.telefono : userInfo?.telefono || ""}
            onChangeText={handleChange("telefono")}
            editable={isEditing && !saving}
            error={errors.telefono}
            placeholder="Ej: 11 1234 5678"
            icon="call-outline"
            keyboardType="phone-pad"
          />
          <InputField
            label="Correo electrónico"
            value={userInfo?.email || ""}
            editable={false}
            icon="mail-outline"
          />

          {isEditing && (
            <Text style={[styles.note, { color: textMuted }]} allowFontScaling>
              Los cambios se guardan en tu cuenta y estarán disponibles en tu próximo inicio de
              sesión.
            </Text>
          )}
        </Card>

        <Card>
          <View style={styles.cardTitleRow}>
            <Ionicons name="shield-checkmark-outline" size={20} color={success} />
            <Text style={[styles.cardTitle, { color: text }]} allowFontScaling>
              Seguridad
            </Text>
          </View>
          <Text style={[styles.cardDescription, { color: textSecondary }]} allowFontScaling>
            Cambiá tu contraseña periódicamente para mantener tu cuenta protegida.
          </Text>
          <Button
            variant="secondary"
            size="md"
            onPress={handlePassword}
            icon="key-outline"
            iconPosition="left"
          >
            Cambiar contraseña
          </Button>
        </Card>

        <Card>
          <View style={styles.cardTitleRow}>
            <Ionicons name="ticket-outline" size={20} color={primary} />
            <Text style={[styles.cardTitle, { color: text }]} allowFontScaling>
              Accesos rápidos
            </Text>
          </View>
          <QuickLink
            icon="ticket-outline"
            label="Mis reservas"
            onPress={() => router.push("/(tabs)/reserva")}
          />
          <QuickLink
            icon="search-outline"
            label="Buscar pasajes"
            onPress={() => router.push("/(tabs)/viajes")}
          />
        </Card>

        <Card>
          <View style={styles.cardTitleRow}>
            <Ionicons name="help-circle-outline" size={20} color={primary} />
            <Text style={[styles.cardTitle, { color: text }]} allowFontScaling>
              Ayuda
            </Text>
          </View>
          <Text style={[styles.cardDescription, { color: textSecondary }]} allowFontScaling>
            ¿Tenés dudas sobre tu reserva, pagos o cancelaciones? Escribinos.
          </Text>
          <Button
            variant="secondary"
            size="md"
            onPress={handleHelp}
            icon="mail-outline"
            iconPosition="left"
          >
            Contactar soporte
          </Button>
        </Card>

        <Card style={styles.logoutCard}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="log-out-outline" size={20} color={useThemeColor({}, "error")} />
            <Text style={[styles.cardTitle, { color: text }]} allowFontScaling>
              Cerrar sesión
            </Text>
          </View>
          <Text style={[styles.cardDescription, { color: textSecondary }]} allowFontScaling>
            Salí de tu cuenta de forma segura en este dispositivo.
          </Text>
          <Button
            variant="primary"
            size="md"
            onPress={handleLogout}
            icon="log-out-outline"
            iconPosition="left"
            style={{ backgroundColor: useThemeColor({}, "error"), borderColor: useThemeColor({}, "error") }}
          >
            Cerrar sesión
          </Button>
        </Card>
      </ScrollView>
    </ScreenContainer>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  return (
    <Button
      variant="ghost"
      size="md"
      onPress={onPress}
      icon={icon}
      iconPosition="left"
      style={styles.quickLink}
      textStyle={StyleSheet.flatten([styles.quickLinkText, { color: text }])}
    >
      {label}
    </Button>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scroll: {
    flex: 1,
  },
  container: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 4,
  },
  avatarCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  name: {
    fontSize: 22,
    fontWeight: "900",
  },
  email: {
    fontSize: 14,
    fontWeight: "600",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  cardDescription: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginBottom: 14,
  },
  note: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  quickLink: {
    justifyContent: "flex-start",
    borderWidth: 0,
    paddingHorizontal: 0,
  },
  quickLinkText: {
    fontSize: 15,
  },
  logoutCard: {
    borderWidth: 1,
    borderColor: "rgba(239,68,68,0.2)",
  },
});
