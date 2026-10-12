import { Redirect, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Platform, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
}
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Hola {userInfo?.nombre}!</Text>

        <View style={styles.profileBox}>
          <Text style={styles.label}>Usuario:</Text>
          <Text style={styles.value}>{userInfo?.usuario}</Text>
        </View>

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/pantallas/modificarUsuario",
                params: { id: userInfo.id },
              })
            }
          >
            <Text style={styles.buttonText}>Editar Perfil</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              router.push({
                pathname: "/pantallas/actualizarContrasenia",
                params: { id: userInfo.id },
              })
            }
          >
            <Text style={styles.buttonText}>Cambiar Contraseña</Text>
          </TouchableOpacity>
           {userInfo?.perfil === "usuarioCliente" && (
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push({
                  pathname: "/(tabs)/reserva",
                })
              }
            >
              <Text style={styles.buttonText}>Mis Reservas</Text>
            </TouchableOpacity>
          )}
          {userInfo?.perfil === "usuarioEmpresa" && (
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                router.push({
                  pathname: "/pantallas/modificarEmpresa",
                  params: { id: userInfo.empresa_id },
                })
              }
            >
              <Text style={styles.buttonText}>Editar Empresa</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f4f4f4",
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: Platform.OS === "web" ? "50%" : "90%",
    maxWidth: 600,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#34495e",
    marginBottom: 20,
    textAlign: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#4c68d7",
    paddingBottom: 10,
  },
  profileBox: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "500",
    color: "#222",
  },
  buttonGroup: {
    gap: 12,
  },
  button: {
    backgroundColor: "#4c68d7",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  logoutButton: {
    backgroundColor: "#dc3545",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
