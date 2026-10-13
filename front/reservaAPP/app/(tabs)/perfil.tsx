import React from 'react';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Storage from '../../utils/storage';

export default function PerfilesScreen() {
  const router = useRouter();
  const { logout, userInfo } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
    const allKeys = await Storage.getAllKeys();
    const allData = await Storage.multiGet(allKeys);
    console.log('Contenido de Storage perfil:', allData);
  };

  const getPerfilTitle = (perfil?: string) => {
    switch (perfil) {
      case "usuarioEmpresa":
        return "Empresa";
      case "usuarioChofer":
        return "Chofer";
      case "usuarioMostrador":
        return "Boletería / Mostrador";
      case "usuarioAdministrador":
        return "Administrador";
      default:
        return "Pasajero";
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.container}>
        {/* Avatar & Header */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={40} color="#38bdf8" />
          </View>
          <Text style={styles.userName}>{userInfo?.nombre || "Usuario"}</Text>
          <Text style={styles.userUsername}>@{userInfo?.usuario}</Text>
          
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{getPerfilTitle(userInfo?.perfil)}</Text>
          </View>
        </View>

        {/* Info Box */}
        {userInfo?.email && (
          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color="#94a3b8" />
            <Text style={styles.infoValue}>{userInfo.email}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/pantallas/modificarUsuario",
                params: { id: userInfo?.id },
              })
            }
          >
            <View style={styles.btnLeft}>
              <Ionicons name="create-outline" size={20} color="#38bdf8" />
              <Text style={styles.btnText}>Editar Perfil</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#64748b" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            activeOpacity={0.8}
            onPress={() =>
              router.push({
                pathname: "/pantallas/actualizarContrasenia",
                params: { id: userInfo?.id },
              })
            }
          >
            <View style={styles.btnLeft}>
              <Ionicons name="key-outline" size={20} color="#38bdf8" />
              <Text style={styles.btnText}>Cambiar Contraseña</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#64748b" />
          </TouchableOpacity>

          {userInfo?.perfil === "usuarioCliente" && (
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/reserva")}
            >
              <View style={styles.btnLeft}>
                <Ionicons name="ticket-outline" size={20} color="#34d399" />
                <Text style={styles.btnText}>Mis Reservas</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </TouchableOpacity>
          )}

          {userInfo?.perfil === "usuarioEmpresa" && (
            <TouchableOpacity
              style={styles.actionBtn}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/pantallas/modificarEmpresa",
                  params: { id: userInfo?.empresa_id },
                })
              }
            >
              <View style={styles.btnLeft}>
                <Ionicons name="business-outline" size={20} color="#fbbf24" />
                <Text style={styles.btnText}>Editar Datos de Empresa</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, styles.logoutBtn]}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <View style={styles.btnLeft}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={[styles.btnText, { color: "#ef4444" }]}>Cerrar Sesión</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  container: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "rgba(30, 41, 59, 0.9)",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    borderWidth: 2,
    borderColor: "#38bdf8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#ffffff",
  },
  userUsername: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 8,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.4)",
  },
  roleText: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoValue: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  buttonGroup: {
    gap: 10,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
  },
  btnLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  btnText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
  },
  logoutBtn: {
    borderColor: "rgba(239, 68, 68, 0.3)",
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    marginTop: 8,
  },
});
