import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { crearVenta } from "../../services/ventaService";
import { useAuth } from "../../context/AuthContext";

export default function CrearVenta() {
  const { id } = useLocalSearchParams();
  const [formaPago, setFormaPago] = useState("");
  const [descuento, setDescuento] = useState("0");
  const router = useRouter();
  const { isLoading, logout, userInfo } = useAuth();

  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioChofer") {
      logout();
      router.replace("/login");
    }
  }, [isLoading, userInfo]);

  if (isLoading || !userInfo) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }
  const guardarVenta = async () => {
    try {
      if (!formaPago || !descuento) {
        Alert.alert("Campos requeridos", "Por favor completa todos los campos");
        return;
      }

      const ventaData = {
        reserva_id: Number(id),
        formaPago,
        descuento: Number(descuento),
      };

      // Aquí podrías enviar la info al backend o a otra pantalla
      console.log("Forma de pago:", formaPago);
      console.log("Descuento:", descuento);
      await crearVenta(ventaData);
      Alert.alert("Venta registrada", "La venta fue registrada correctamente");

      if (userInfo?.perfil === "usuarioCliente") {
        router.push({
          pathname: "/pantallas/detalleVenta",
          params: { id: id.toString() },
        });
      } else {
        router.replace({ pathname: "/choferReserva" });
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el pasajero");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Forma de pago:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Efectivo, Tarjeta, Transferencia"
        value={formaPago}
        onChangeText={setFormaPago}
      />

      <Text style={styles.label}>Descuento (%):</Text>
      <TextInput
        style={[styles.input, { backgroundColor: "#f0f0f0" }]}
        value={descuento}
        editable={false}
      />

      <TouchableOpacity style={styles.botonConfirmar} onPress={guardarVenta}>
        <Text style={styles.botonTexto}>Confirmar Venta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginTop: 6,
  },
  botonConfirmar: {
    marginTop: 24,
    backgroundColor: "#28a745",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    alignSelf: "center",
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
