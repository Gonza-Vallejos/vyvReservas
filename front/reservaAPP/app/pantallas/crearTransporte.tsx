import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "@/context/AuthContext";
import { crearTransporte } from "../../services/transporteService";
import { Redirect, router } from "expo-router";

type ErroresTransporte = {
  nombre?: string;
  patente?: string;
  marca?: string;
  cantLugares?: string;
};

const CrearTransporte = () => {
  const [nombre, setNombre] = useState("");
  const [patente, setPatente] = useState("");
  const [marca, setMarca] = useState("");
  const [cantLugares, setCantLugares] = useState("");
  const [errores, setErrores] = useState<ErroresTransporte>({});
  const { isLoading, logout, userInfo } = useAuth();

  const mostrarAlerta = (titulo: string, mensaje: string) => {
    if (Platform.OS === "web") {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const handleGuardar = async () => {
    if (!nombre || !patente || !marca || !cantLugares) {
      mostrarAlerta(
        "Campos incompletos",
        "Por favor, completa todos los campos"
      );
      return;
    }

    try {
      const nuevoTransporte = {
        nombre,
        patente,
        marca,
        cantLugares: parseInt(cantLugares),
        empresa_id: userInfo?.empresa_id,
      };

      await crearTransporte(nuevoTransporte);

      if (Platform.OS === "web") {
        window.alert(`Transporte creado correctamente`);
      } else {
        Alert.alert("Exito", "Transporte creado correctamente");
      }
      router.push({ pathname: "/(tabs)/listarTransportes" });
    } catch (error: any) {
      const erroresBackend = error?.response?.data?.errores;

      if (erroresBackend && Array.isArray(erroresBackend)) {
        const erroresFormateados: ErroresTransporte = {};
        erroresBackend.forEach((err: any) => {
          erroresFormateados[err.path as keyof ErroresTransporte] = err.msg;
        });
        setErrores(erroresFormateados);
      } else {
        const mensajeError =
          error?.response?.data?.error || "Error al crear el transporte.";
        mostrarAlerta("Error", mensajeError);
      }
    }
  };
  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioMostrador") {
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
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Nuevo Transporte</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nombre</Text>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          placeholderTextColor="#888"
          value={nombre}
          onChangeText={(text) => {
            setNombre(text);
            setErrores((prev) => ({ ...prev, nombre: "" }));
          }}
        />
        {errores.nombre && (
          <Text style={styles.errorText}>{errores.nombre}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Patente</Text>
        <TextInput
          style={styles.input}
          placeholder="Patente"
          placeholderTextColor="#888"
          value={patente}
          onChangeText={(text) => {
            setPatente(text);
            setErrores((prev) => ({ ...prev, patente: "" }));
          }}
        />
        {errores.patente && (
          <Text style={styles.errorText}>{errores.patente}</Text>
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Marca</Text>
        <TextInput
          style={styles.input}
          placeholder="Marca"
          placeholderTextColor="#888"
          value={marca}
          onChangeText={(text) => {
            setMarca(text);
            setErrores((prev) => ({ ...prev, marca: "" }));
          }}
        />
        {errores.marca && <Text style={styles.errorText}>{errores.marca}</Text>}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Cantidad de Lugares</Text>
        <TextInput
          style={styles.input}
          placeholder="Cantidad de lugares"
          placeholderTextColor="#888"
          value={cantLugares}
          onChangeText={(text) => {
            setCantLugares(text);
            setErrores((prev) => ({ ...prev, cantLugares: "" }));
          }}
          keyboardType="numeric"
        />
        {errores.cantLugares && (
          <Text style={styles.errorText}>{errores.cantLugares}</Text>
        )}
      </View>

      <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
        <Text style={styles.botonTexto}>Guardar Transporte</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  inputGroup: { marginBottom: 8 },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
    backgroundColor: "#fff",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
    marginBottom: 4,
  },
  botonGuardar: {
    backgroundColor: "#4c68d7",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignSelf: "center",
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default CrearTransporte;
