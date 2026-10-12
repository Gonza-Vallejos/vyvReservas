import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TextInput,
  Alert,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { obtenerViajesId } from "../../services/viajeServices";
import { crearReserva } from "../../services/reservaService";
import { useAuth } from "../../context/AuthContext";
import { obtenerUsuarioPorId } from "../../services/usuarioService";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

interface Pasajero {
  nombre: string;
  apellido: string;
  dni: string;
  ubicacionOrigen: string;
  ubicacionDestino: string;
}

interface Viaje {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  fechaViaje: string;
  horarioSalida: string;
  precio: number;
  chofer: string;
}

export default function DetalleViaje() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [viaje, setViaje] = useState<Viaje | null>(null);
  const [pasajeros, setPasajeros] = useState<Pasajero[]>([
    {
      nombre: "",
      apellido: "",
      dni: "",
      ubicacionOrigen: "",
      ubicacionDestino: "",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const [erroresBackend, setErroresBackend] = useState<{
    [key: string]: string;
  }>({});

 const [focusedInput, setFocusedInput] = useState<string | null>(null);


  const mensajesAyuda = {
    ubicacionOrigen: "Ingrese calles con numero o intersecciones. Ej. Salta 1200; Laprida y Jujuy.",
    ubicacionDestino: "Ingrese calles con numero o intersecciones. Ej. Salta 1200; Laprida y Jujuy.",
  };
  const { isLoading, logout, userInfo } = useAuth();

  const usuarios_id = userInfo?.id;

  useEffect(() => {
    if (id) {
      obtenerViajesId(Number(id))
        .then((data) => setViaje(data))
        .catch((error) => console.error("Error al obtener el viaje:", error));
    }
  }, [id]);

  const formatDate = (fechaISO: string) => {
    const [year, month, day] = fechaISO.split("T")[0].split("-").map(Number);
    return `${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return `${hours}:${minutes}`;
  };

  const handleChangePasajero = (
    index: number,
    field: keyof Pasajero,
    value: string
  ) => {
    const nuevosPasajeros = [...pasajeros];
    nuevosPasajeros[index][field] = value;
    setPasajeros(nuevosPasajeros);

    const path = `personas[${index}].${field}`;
    if (erroresBackend[path]) {
      setErroresBackend((prev) => {
        const nuevosErrores = { ...prev };
        delete nuevosErrores[path];
        return nuevosErrores;
      });
    }
  };

  const agregarPasajero = () => {
    if (pasajeros.length >= 3) {
      Alert.alert("Límite alcanzado", "Solo puedes agregar hasta 3 pasajeros.");
      return;
    }
    setPasajeros([
      ...pasajeros,
      {
        nombre: "",
        apellido: "",
        dni: "",
        ubicacionOrigen: "",
        ubicacionDestino: "",
      },
    ]);
  };
  const eliminarPasajero = (index: number) => {
    if (index === 0) return; // No eliminar el primer pasajero
    const nuevosPasajeros = pasajeros.filter((_, i) => i !== index);
    setPasajeros(nuevosPasajeros);
  };
  const validarPasajeros = () => {
    for (const p of pasajeros) {
      if (
        !p.nombre ||
        !p.apellido ||
        !p.dni ||
        !p.ubicacionOrigen ||
        !p.ubicacionDestino
      ) {
        return false;
      }
    }
    return true;
  };

  const rellenarConMisDatos = async () => {
    try {
      if (!usuarios_id) return;

      const response = await obtenerUsuarioPorId(usuarios_id);

      const usuario = Array.isArray(response) ? response[0] : response;

      if (!usuario) {
        throw new Error("No se encontraron datos del usuario");
      }

      const nuevosPasajeros = [...pasajeros];
      nuevosPasajeros[0] = {
        ...nuevosPasajeros[0],
        nombre: usuario.nombre ? String(usuario.nombre) : "",
        apellido: usuario.apellido ? String(usuario.apellido) : "",
        dni: usuario.dni ? String(usuario.dni) : "",
      };
      setPasajeros(nuevosPasajeros);

      console.log("Datos cargados:", usuario); //  Para verificar
    } catch (error) {
      console.error("Error al obtener datos del usuario:", error);
      Platform.OS === "web"
        ? alert("No se pudieron cargar tus datos.")
        : Alert.alert("Error", "No se pudieron cargar tus datos.");
    }
  };

  const reservar = async () => {
    if (!viaje) return;

    if (!validarPasajeros()) {
      Platform.OS === "web"
        ? alert(
            "Campos incompletos: Por favor, completa todos los campos de los pasajeros."
          )
        : Alert.alert(
            "Campos incompletos",
            "Por favor, completa todos los campos de los pasajeros."
          );
      return;
    }

    try {
      setLoading(true);
      setErroresBackend({});
      const reservaData = {
        usuarios_id,
        viajes_id: viaje.id,
        personas: pasajeros,
      };

      const response = await crearReserva(reservaData);
      const mensaje =
        response?.mensaje ||
        "Tu reserva fue creada en Mis Reservas.";

      if (Platform.OS === "web") {
        alert("Reserva exitosa: " + mensaje);
        router.push("/(tabs)/reserva");
      } else {
        Alert.alert("Reserva exitosa", mensaje, [
          {
            text: "OK",
            onPress: () => router.push("/(tabs)/reserva"),
          },
        ]);
      }

      setPasajeros([
        {
          nombre: "",
          apellido: "",
          dni: "",
          ubicacionOrigen: "",
          ubicacionDestino: "",
        },
      ]);
    } catch (error: any) {
      const respuesta = error?.response?.data;
      const errores = respuesta?.errores;

      if (Array.isArray(errores)) {
        const erroresMap: { [key: string]: string } = {};
        errores.forEach((err: any) => {
          if (err.path) {
            erroresMap[err.path] = err.msg;
          } else if (err.msg?.includes("duplicado")) {
            // Repartimos el mensaje a todos los DNIs
            pasajeros.forEach((_, i) => {
              erroresMap[`personas[${i}].dni`] = err.msg;
            });
          }
        });
        setErroresBackend(erroresMap);

        const mensaje =
          "Verificá los datos de los pasajeros. Hay campos con errores.";
        Platform.OS === "web"
          ? alert("Error de validación: " + mensaje)
          : Alert.alert("Error de validación", mensaje);
      } else {
        const mensaje =
          respuesta?.mensaje || "Hubo un error inesperado al crear la reserva.";
        Platform.OS === "web"
          ? alert("Atención !! " + mensaje)
          : Alert.alert("Atención !!", mensaje);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioCliente") {
      logout();
      router.replace("/login");
    }
  }, [isLoading, userInfo]);

  if (isLoading || !userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!viaje) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={120}
    >
      <View>
        <Text style={styles.title}>Detalle del Viaje</Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.label}>Origen</Text>
              <Text style={styles.value}>{viaje.origenLocalidad}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.label}>Destino</Text>
              <Text style={styles.value}>{viaje.destinoLocalidad}</Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.label}>Fecha</Text>
              <Text style={styles.value}>{formatDate(viaje.fechaViaje)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.label}>Horario</Text>
              <Text style={styles.value}>
                {formatTime(viaje.horarioSalida)}
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.label}>Precio</Text>
              <Text style={styles.value}>
                $
                {viaje.precio.toLocaleString("es-AR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </Text>
            </View>
            <View style={styles.infoBox}></View>
          </View>
        </View>

        <Text style={[styles.title, { marginTop: 30 }]}>
          Datos de Pasajeros
        </Text>
        {/* Botón Rellenar con mis datos */}
        <TouchableOpacity
          onPress={rellenarConMisDatos}
          style={styles.rellenarButton}
        >
          <Text style={styles.rellenarButtonText}>Cargar mis datos</Text>
        </TouchableOpacity>

        {pasajeros.map((pasajero, index) => (
          <View key={index} style={styles.pasajeroCard}>
            {index !== 0 && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => eliminarPasajero(index)}
              >
                <Image
                  source={require("../../assets/images/icons8-close-50.png")}
                  style={styles.iconoEliminar}
                />
              </TouchableOpacity>
            )}
            <View style={styles.inputGroup}>
              <Text style={styles.label1}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                placeholderTextColor="#888"
                value={pasajero.nombre}
                onChangeText={(text) =>
                  handleChangePasajero(index, "nombre", text)
                }
              />
              {erroresBackend[`personas[${index}].nombre`] && (
                <Text style={{ color: "red", fontSize: 12 }}>
                  {erroresBackend[`personas[${index}].nombre`]}
                </Text>
              )}
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label1}>Apellido</Text>
              <TextInput
                style={styles.input}
                placeholder="Apellido"
                placeholderTextColor="#888"
                value={pasajero.apellido}
                onChangeText={(text) =>
                  handleChangePasajero(index, "apellido", text)
                }
              />
              {erroresBackend[`personas[${index}].apellido`] && (
                <Text style={{ color: "red", fontSize: 12 }}>
                  {erroresBackend[`personas[${index}].apellido`]}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label1}>DNI</Text>
              <TextInput
                style={styles.input}
                placeholder="DNI"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={pasajero.dni}
                onChangeText={(text) =>
                  handleChangePasajero(index, "dni", text)
                }
              />

              {erroresBackend[`personas[${index}].dni`] && (
                <Text style={{ color: "red", fontSize: 12 }}>
                  {erroresBackend[`personas[${index}].dni`]}
                </Text>
              )}
            </View>
               <View style={styles.inputGroup}>
        <Text style={styles.label1}>Ubicación de Origen</Text>
        <TextInput
          style={styles.input}
          placeholder="Ubicación de Origen"
          placeholderTextColor="#888"
          value={pasajero.ubicacionOrigen}
          onFocus={() => setFocusedInput("ubicacionOrigen")}
          onBlur={() => setFocusedInput(null)}
          onChangeText={(text) => {
            handleChangePasajero(index, "ubicacionOrigen", text);
            if (text.length > 0) setFocusedInput(null); // desaparece cuando escribe
          }}
        />
        {/* Mensaje de ayuda */}
        {focusedInput === "ubicacionOrigen" && !pasajero.ubicacionOrigen && (
          <Text style={{ color: "blue", fontSize: 12 }}>
            {mensajesAyuda.ubicacionOrigen}
          </Text>
        )}

        {/* Error backend */}
        {erroresBackend[`personas[${index}].ubicacionOrigen`] && (
          <Text style={{ color: "red", fontSize: 12 }}>
            {erroresBackend[`personas[${index}].ubicacionOrigen`]}
          </Text>
        )}
      </View>

      {/* Ubicación de Destino */}
      <View style={styles.inputGroup}>
        <Text style={styles.label1}>Ubicación de Destino</Text>
        <TextInput
          style={styles.input}
          placeholder="Ubicación de Destino"
          placeholderTextColor="#888"
          value={pasajero.ubicacionDestino}
          onFocus={() => setFocusedInput("ubicacionDestino")}
          onBlur={() => setFocusedInput(null)}
          onChangeText={(text) => {
            handleChangePasajero(index, "ubicacionDestino", text);
            if (text.length > 0) setFocusedInput(null);
          }}
        />
        {/* Mensaje de ayuda */}
        {focusedInput === "ubicacionDestino" && !pasajero.ubicacionDestino && (
          <Text style={{ color: "blue", fontSize: 12 }}>
            {mensajesAyuda.ubicacionDestino}
          </Text>
        )}

        {/* Error backend */}
        {erroresBackend[`personas[${index}].ubicacionDestino`] && (
          <Text style={{ color: "red", fontSize: 12 }}>
            {erroresBackend[`personas[${index}].ubicacionDestino`]}
          </Text>
        )}
      </View>
          </View>
        ))}

        {pasajeros.length < 3 && (
          <TouchableOpacity
            onPress={agregarPasajero}
            style={styles.agregarButton}
          >
            <Text style={styles.agregarButtonText}>Agregar otro pasajero</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={reservar}
          style={[
            styles.reservarButton,
            loading && { backgroundColor: "#ccc" },
          ]}
          disabled={loading}
        >
          <Text style={styles.reservarButtonText}>{"Reservar"}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  volverButton: {
    marginBottom: 10,
  },
  volverText: {
    color: "#007AFF",
    fontSize: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#007AFF",
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: "#333",
    marginTop: 4,
  },
  pasajeroCard: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    shadowColor: "#000",
  },
  input: {
    height: 40,
    borderColor: "#007AFF",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  agregarButton: {
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
    elevation: 5,
    transform: [{ scale: 1 }],
    transitionDuration: "200ms",
    marginVertical: 8,
    alignSelf: "center",
  },
  agregarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  reservarButton: {
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
    transform: [{ scale: 1 }],
    transitionDuration: "200ms",
    marginVertical: 8,
    alignSelf: "center",
  },
  reservarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoBox: {
    flex: 1,
    marginHorizontal: 4,
  },
  inputGroup: {
    marginBottom: 8,
  },
  label1: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  rellenarButton: {
    backgroundColor: "#4c68d7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
    alignSelf: "flex-end",
  },
  rellenarButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,

    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    fontWeight: "bold",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  iconoEliminar: {
    width: 20,
    height: 20,
    marginLeft: -10,
    tintColor: "#333",
  },
});
