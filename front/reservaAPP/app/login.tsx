import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../context/AuthContext";
import { loginUsuario } from "../services/authService";
import { useTheme } from "@/components/Themed";
import {
  Button,
  InputField,
  FeedbackBanner,
  Card,
  Title,
  Subtitle,
  Body,
  Caption,
  FadeInView,
} from "@/components/ui";
import { Spacing, Radii } from "@/constants/Spacing";

export default function LoginScreen({
  onLoginSuccess,
}: {
  onLoginSuccess?: () => void;
}) {
  const { login } = useAuth();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const [usuario, setUsuario] = useState("");
  const [contrasenia, setPassword] = useState("");
  const [errorMensaje, setErrorMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordInputRef = useRef<any>(null);

  const handleLogin = async () => {
    if (!usuario.trim() || !contrasenia.trim()) {
      setErrorMensaje("Por favor ingresa tu usuario y contraseña");
      return;
    }

    setLoading(true);
    setErrorMensaje("");
    try {
      const limpioUsuario = usuario.trim();
      const limpiaContrasenia = contrasenia.trim();
      const res = await loginUsuario(limpioUsuario, limpiaContrasenia);
      const token = res?.data?.token || res?.token;

      if (!token) {
        throw new Error("No se recibió token del servidor");
      }

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
        error.response?.data?.message ||
        error.response?.data?.mensaje ||
        (error.message?.includes("Network")
          ? "Error de conexión con el servidor. Verifica tu internet."
          : "Usuario o contraseña incorrectos");
      setErrorMensaje(mensaje);
    } finally {
      setLoading(false);
    }
  };

  const handleUsuarioChange = (text: string) => {
    setUsuario(text);
    if (errorMensaje) setErrorMensaje("");
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errorMensaje) setErrorMensaje("");
  };

  const renderForm = () => (
    <Card variant="elevated" style={styles.cardContainer}>
      <Title align="center" style={styles.cardTitle}>
        Iniciar sesión
      </Title>
      <Caption align="center" color="textMuted" style={styles.cardSubtitle}>
        Ingresá con tus credenciales para continuar
      </Caption>

      {errorMensaje ? (
        <FeedbackBanner
          type="error"
          message={errorMensaje}
          onDismiss={() => setErrorMensaje("")}
          style={{ marginBottom: Spacing.md }}
        />
      ) : null}

      <InputField
        label="Usuario o Email"
        icon="person-outline"
        placeholder="ej: usuario@ejemplo.com"
        autoCapitalize="none"
        autoCorrect={false}
        value={usuario}
        onChangeText={handleUsuarioChange}
        returnKeyType="next"
        onSubmitEditing={() => passwordInputRef.current?.focus()}
        required
      />

      <InputField
        ref={passwordInputRef}
        label="Contraseña"
        icon="lock-closed-outline"
        placeholder="••••••••"
        isPassword
        value={contrasenia}
        onChangeText={handlePasswordChange}
        onSubmitEditing={handleLogin}
        returnKeyType="done"
        required
      />

      <Button
        variant="primary"
        size="lg"
        fullWidth
        loading={loading}
        onPress={handleLogin}
        style={styles.submitButton}
      >
        Ingresar
      </Button>

      <View style={styles.linksContainer}>
        <Body align="center" color="textSecondary" style={styles.signupText}>
          ¿No tenés cuenta?{" "}
          <Text
            style={[styles.linkHighlight, { color: colors.primary }]}
            onPress={() => router.push("/registro")}
          >
            Registrarse
          </Text>
        </Body>

        <Pressable
          onPress={() => router.push("/recuperarContrasenia")}
          hitSlop={8}
          style={styles.forgotPasswordButton}
        >
          <Caption align="center" color="primary">
            ¿Olvidaste tu contraseña?
          </Caption>
        </Pressable>
      </View>
    </Card>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
    >
      {Platform.OS === "web" ? (
        <View style={styles.webWrapper}>
          <FadeInView delay={0} duration={320} direction="none" style={styles.webBrandSide}>
            <Image
              source={require("../assets/images/bus-icon.png")}
              style={[styles.webLogo, { tintColor: colors.primary }]}
              resizeMode="contain"
            />
            <Title style={styles.webBrandTitle}>V&V Reservas</Title>
            <Subtitle color="textSecondary" style={styles.webBrandSlogan}>
              Tu plataforma de viajes y reservas interurbanas de minibús.
            </Subtitle>
          </FadeInView>
          <FadeInView delay={100} duration={320} direction="up" style={styles.webFormSide}>
            {renderForm()}
          </FadeInView>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollWrapper}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <FadeInView delay={0} duration={300} direction="down" style={styles.mobileHeader}>
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: isDark ? colors.surfaceElevated : colors.primaryLight },
              ]}
            >
              <Image
                source={require("../assets/images/bus-icon.png")}
                style={[styles.mobileLogo, { tintColor: colors.primary }]}
                resizeMode="contain"
              />
            </View>
            <Title style={styles.mobileTitle}>V&V Reservas</Title>
            <Caption color="textMuted">Viajes y traslados seguros</Caption>
          </FadeInView>

          <FadeInView delay={90} duration={320} direction="up">
            {renderForm()}
          </FadeInView>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollWrapper: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing["2xl"],
  },
  mobileHeader: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  iconBadge: {
    width: 68,
    height: 68,
    borderRadius: Radii.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  mobileLogo: {
    width: 36,
    height: 36,
  },
  mobileTitle: {
    fontSize: 26,
    fontWeight: "800",
    marginBottom: Spacing.xs,
  },
  cardContainer: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    padding: Spacing.xl,
    borderRadius: Radii.xl,
  },
  cardTitle: {
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    marginBottom: Spacing.lg,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
  linksContainer: {
    marginTop: Spacing.lg,
    alignItems: "center",
  },
  signupText: {
    marginBottom: Spacing.sm,
  },
  linkHighlight: {
    fontWeight: "700",
  },
  forgotPasswordButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  // Adaptabilidad Web
  webWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 960,
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: Spacing.xl,
  },
  webBrandSide: {
    flex: 1,
    paddingRight: Spacing["3xl"],
    alignItems: "flex-start",
  },
  webLogo: {
    width: 56,
    height: 56,
    marginBottom: Spacing.md,
  },
  webBrandTitle: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: Spacing.sm,
  },
  webBrandSlogan: {
    fontSize: 17,
    lineHeight: 24,
  },
  webFormSide: {
    flex: 1,
    maxWidth: 400,
    width: "100%",
  },
});
