import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Button,
  Platform,
} from "react-native";
import ModalSelector from "react-native-modal-selector";
import {
  obtenerUsuariosPorEmpresa,
  actualizarPerfil,
  eliminarUsuario,
} from "../../services/usuarioService";
import { useAuth } from "../../context/AuthContext";
import { Redirect } from "expo-router";

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  email: string;
  usuario: string;
  contrasenia: string;
  perfil_id: number;
}

const perfiles = [
  { key: 3, label: "Mostrador" },
  { key: 4, label: "Chofer" },
];

export default function UsuarioScreen() {
  const { logout, userInfo } = useAuth();

  if (
    !userInfo ||
    !["usuarioEmpresa", "usuarioMostrador"].includes(userInfo.perfil)
  ) {
    logout();
    return <Redirect href="/login" />;
  }

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [seleccionado, setSeleccionado] = useState<number | null>(null);
  const [filtro, setFiltro] = useState<number | null>(null);

  const ultimaSeleccionRef = useRef<{
    usuarioId: number;
    perfilId: number;
  } | null>(null);

  useEffect(() => {
    obtenerUsuario();
  }, []);

  const obtenerUsuario = async () => {
    try {
      if (!userInfo?.empresa_id) return;
      const data = await obtenerUsuariosPorEmpresa(userInfo.empresa_id);
      
      console.log('ver data', data)
      let filtrados: Usuario[] = [];

      if (userInfo.perfil === "usuarioEmpresa") {
        filtrados = data.filter(
          (u: any) => u.perfil_id === 3 || u.perfil_id === 4
        );
      } else if (userInfo.perfil === "usuarioMostrador") {
        filtrados = data.filter((u: any) => u.perfil_id === 4);
      }

      setUsuarios(filtrados);
      console.log('ver filtrados ', filtrados)
      setUsuariosFiltrados(filtrados);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
    } finally {
      setCargando(false);
    }
  };

  const toggleExpand = (id: number) => {
    setSeleccionado(seleccionado === id ? null : id);
  };

  const filtrarPorPerfil = (perfilId: number | null) => {
    setFiltro(perfilId);
    const base = usuarios.filter((u) => u.perfil_id === 3 || u.perfil_id === 4);
    if (perfilId === null) {
      setUsuariosFiltrados(base);
    } else {
      setUsuariosFiltrados(base.filter((u) => u.perfil_id === perfilId));
    }
    setSeleccionado(null);
  };

  const obtenerNombrePerfil = (id: number): string => {
    switch (id) {
      case 3:
        return "Mostrador";
      case 4:
        return "Chofer";
      default:
        return "Desconocido";
    }
  };

  const cambiarPerfilUsuario = async (
    usuarioId: number,
    nuevoPerfilId: number
  ) => {
    try {
      await actualizarPerfil(usuarioId, nuevoPerfilId);
      const nuevosUsuarios = usuarios.map((u) =>
        u.id === usuarioId ? { ...u, perfil_id: nuevoPerfilId } : u
      );
      setUsuarios(nuevosUsuarios);
      if (filtro === null) {
        setUsuariosFiltrados(nuevosUsuarios);
      } else {
        setUsuariosFiltrados(
          nuevosUsuarios.filter((u) => u.perfil_id === filtro)
        );
      }
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
    }
  };
  const handleEliminarUsuario = (id: number) => {
    const eliminar = async () => {
      try {
        await eliminarUsuario(id);
        const nuevosUsuarios = usuarios.filter((u) => u.id !== id);
        setUsuarios(nuevosUsuarios);
        setUsuariosFiltrados(
          nuevosUsuarios.filter(
            (u) => filtro === null || u.perfil_id === filtro
          )
        );

        if (Platform.OS === "web") {
          alert("Usuario eliminado con éxito");
        } else {
          Alert.alert("Éxito", "Usuario eliminado con éxito");
        }
      } catch (error) {
        if (Platform.OS === "web") {
          alert("Error: No se pudo eliminar el usuario");
        } else {
          Alert.alert("Error", "No se pudo eliminar el usuario");
        }
      }
    };

    if (Platform.OS === "web") {
      const confirmado = window.confirm(
        "¿Estás seguro que deseas eliminar este usuario?"
      );
      if (confirmado) {
        eliminar();
      }
    } else {
      Alert.alert(
        "Confirmar eliminación",
        "¿Estás seguro que deseas eliminar este usuario?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Eliminar", style: "destructive", onPress: eliminar },
        ]
      );
    }
  };

  const renderItem = ({ item }: { item: Usuario }) => {
    const estaExpandido = seleccionado === item.id;

    return (
      <TouchableOpacity
        onPress={() => toggleExpand(item.id)}
        style={[
          styles.usuarioCard,
          estaExpandido && styles.usuarioCardExpandido,
        ]}
        activeOpacity={0.8}
      >
        <Text style={styles.usuarioTitulo}>
          Usuario: {item.usuario} - {item.id}{" "}
        </Text>
        <Text style={styles.usuarioInfo}>
          Nombre: {item.nombre} {item.apellido}
        </Text>
        <Text style={styles.usuarioInfo}>
          Perfil: {obtenerNombrePerfil(item.perfil_id)}
        </Text>

        {estaExpandido && (
          <View style={styles.detalles}>
            <Text style={styles.usuarioInfo}>DNI: {item.dni}</Text>
            <Text style={styles.usuarioInfo}>Teléfono: {item.telefono}</Text>
            <Text style={styles.usuarioInfo}>Email: {item.email}</Text>

            {userInfo.perfil === "usuarioEmpresa" && (
              <>
                <Text style={styles.cambiarPerfilTexto}>Cambiar perfil:</Text>

                <View style={styles.buttonContainer}>
                  <ModalSelector
                    style={styles.editButton}
                    selectStyle={{
                      borderWidth: 0,
                      backgroundColor: "transparent",
                    }}
                    data={perfiles}
                    initValue={obtenerNombrePerfil(item.perfil_id)}
                    initValueTextStyle={{
                      color: "#fff",
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                    onChange={(option) => {
                      const yaSeleccionado =
                        ultimaSeleccionRef.current &&
                        ultimaSeleccionRef.current.usuarioId === item.id &&
                        ultimaSeleccionRef.current.perfilId === option.key;
                      if (!yaSeleccionado) {
                        ultimaSeleccionRef.current = {
                          usuarioId: item.id,
                          perfilId: option.key,
                        };
                        cambiarPerfilUsuario(item.id, option.key);
                      }
                    }}
                  />

                  <TouchableOpacity
                    style={styles.botonEliminar}
                    onPress={() => handleEliminarUsuario(item.id)}
                  >
                    <Text style={styles.botonTexto}>Eliminar Usuario</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.contenedor}>
      {userInfo.perfil === "usuarioEmpresa" && (
        <View style={{ marginBottom: 15 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtros}>
              {[
                { label: "Todos", id: null },
                { label: "Mostrador", id: 3 },
                { label: "Chofer", id: 4 },
              ].map((item) => {
                const activo = filtro === item.id;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.filtroBtn,
                      activo && styles.filtroBtnActivo,
                      { marginTop: 16 },
                    ]}
                    onPress={() => filtrarPorPerfil(item.id)}
                  >
                    <Text
                      style={[
                        styles.filtroTexto,
                        activo && styles.filtroTextoActivo,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}

      {cargando ? (
        <Text>Cargando...</Text>
      ) : (
        <FlatList
          data={usuariosFiltrados}
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
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },

  editButton: {
    backgroundColor: "#4c68d7",
    paddingVertical: 3,
    paddingHorizontal: 25,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  usuarioCard: {
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

  usuarioCardExpandido: {
    backgroundColor: "#e8f0fe",
  },

  usuarioTitulo: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },

  usuarioInfo: {
    fontSize: 14,
    color: "#333",
    marginBottom: 4,
  },

  botonDetalle: {
    backgroundColor: "#17a589",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginTop: 10,
    alignSelf: "flex-start",
  },

  textoBotonDetalle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },

  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  filtros: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    top: -10,
  },
  filtroBtn: {
    backgroundColor: "#4c68d7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    marginLeft: 4,
  },
  filtroBtnActivo: {
    backgroundColor: "#b2babb",
  },
  filtroTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  filtroTextoActivo: {
    color: "#fff",
    fontWeight: "bold",
  },
  usuarioContainer: {
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  nombre: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  detalles: {
    marginTop: 10,
  },
  cambiarPerfilTexto: {
    marginTop: 10,
    color: "black",
    fontWeight: "bold",
  },
  botonEliminar: {
    backgroundColor: "#F44336",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
