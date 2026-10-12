import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from "react-native";
import {
  obtenerEmpresas,
  eliminarEmpresa,
} from "../../services/empresaService";
import {
  obtenerLocalidadesId,
  obtenerProvinciasId,
} from "../../services/viajeServices";
import { useAuth } from "../../context/AuthContext";
import { Redirect } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

interface Empresa {
  id: number;
  nombre: string;
  direccion: string;
  cuit: string;
  telefono: string;
  email: string;
  localidad_id: number;
  localidad_nombre?: string;
  provincia_nombre?: string;
}

export default function EmpresaScreen() {
  const { logout, userInfo } = useAuth();

  if (userInfo?.perfil !== "usuarioAdministrador") {
    logout();
    return <Redirect href="/login" />;
  }

  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      obtenerListado();
    }, [])
  );
  const obtenerListado = async () => {
    try {
      const data = await obtenerEmpresas();

      const empresasConUbicacion = await Promise.all(
        data.map(async (empresa: Empresa) => {
          let localidad_nombre = "Desconocida";
          let provincia_nombre = "Desconocida";

          try {
            const localidadData = await obtenerLocalidadesId(
              empresa.localidad_id
            );
            if (localidadData?.length > 0) {
              localidad_nombre = localidadData[0].nombre;

              const provinciaData = await obtenerProvinciasId(
                localidadData[0].provincia_id
              );
              if (provinciaData?.length > 0) {
                provincia_nombre = provinciaData[0].nombre;
              }
            }
          } catch (e) {
            console.warn(
              `Error obteniendo ubicación para empresa ${empresa.id}:`,
              e
            );
          }

          return {
            ...empresa,
            localidad_nombre,
            provincia_nombre,
          };
        })
      );

      setEmpresas(empresasConUbicacion);
    } catch (error) {
      console.error("Error al obtener empresas:", error);
    } finally {
      setCargando(false);
    }
  };

  const toggleExpand = (id: number) => {
    setSeleccionado(seleccionado === id ? null : id);
  };

  const renderItem = ({ item }: { item: Empresa }) => {
    const estaExpandido = seleccionado === item.id;
    const confirmarEliminacion = (id: number) => {
      const mensaje =
        "¿Estás seguro que querés eliminar esta empresa? Esta acción no se puede deshacer.";

      if (Platform.OS === "web") {
        const confirmacion = window.confirm(mensaje);
        if (confirmacion) handleEliminar(id);
      } else {
        Alert.alert("Confirmar eliminación", mensaje, [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Eliminar",
            style: "destructive",
            onPress: () => handleEliminar(id),
          },
        ]);
      }
    };

    const handleEliminar = async (id: number) => {
      try {
        await eliminarEmpresa(id);
        setEmpresas((prev) => prev.filter((e) => e.id !== id));
        if (seleccionado === id) setSeleccionado(null);
      } catch (error) {
        console.error("Error al eliminar la empresa:", error);
        Alert.alert("Error", "No se pudo eliminar la empresa.");
      }
    };

    return (
      <TouchableOpacity
        onPress={() => toggleExpand(item.id)}
        style={[styles.card, estaExpandido && styles.cardExpandido]}
        activeOpacity={0.8}
      >
        <Text style={styles.tituloCard}>
          Empresa: {item.nombre} - {item.id}
        </Text>
        <Text style={styles.info}>CUIT: {item.cuit}</Text>

        {estaExpandido && (
          <View style={styles.detalles}>
            <Text style={styles.info}>Dirección: {item.direccion}</Text>
            <Text style={styles.info}>Teléfono: {item.telefono}</Text>
            <Text style={styles.info}>Email: {item.email}</Text>
            <Text style={styles.info}>Localidad: {item.localidad_nombre}</Text>
            <Text style={styles.info}>Provincia: {item.provincia_nombre}</Text>

            <TouchableOpacity
              onPress={() => confirmarEliminacion(item.id)}
              style={styles.botonEliminar}
            >
              <Text style={styles.textoBotonEliminar}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.contenedor}>
      {cargando ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={empresas}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    borderLeftWidth: 6,
    borderLeftColor: "#4c68d7",
    width: "99%",
  },
  cardExpandido: {
    backgroundColor: "#e8f0fe",
  },
  tituloCard: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },
  detalles: {
    marginTop: 10,
  },
  botonEliminar: {
    backgroundColor: "#d32f2f",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  textoBotonEliminar: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
