import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  FlatList,
  Image,
} from "react-native";
import { listarViajes, obtenerLocalidades } from "../../services/viajeServices";
import { Redirect, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { useAuth } from "../../context/AuthContext";

interface Viaje {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  horarioSalida: string;
  fechaViaje: string;
  precio: number;
  usuarioEmpresa_id: number;
  medioTransporte_id: number;
  cantPasajeros: number;
  eliminado: string;
  MedioTransporte?: {
    Empresa?: {
      nombre: string;
    };
  };
}

export default function ViajesScreen() {
  const router = useRouter();

  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState<string[]>([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<string[]>([]);
  const [localidades, setLocalidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const origenRef = useRef<HTMLDivElement | null>(null);
  const destinoRef = useRef<HTMLDivElement | null>(null);
  const { logout, userInfo } = useAuth();

  console.log("ver user info viajes: ", userInfo?.perfil);
  if (userInfo?.perfil !== "usuarioCliente") {
    logout();
    return <Redirect href="/login" />;
  }
  useEffect(() => {
    const cargarLocalidades = async () => {
      try {
        const data = await obtenerLocalidades();
        const nombres = data.map((l: any) => l.nombre);
        setLocalidades(nombres);
      } catch (error) {
        console.error("Error al cargar localidades", error);
      }
    };
    cargarLocalidades();

    if (Platform.OS !== "web") return;

    const handleClickOutside = (event: { target: any }) => {
      if (origenRef.current && !origenRef.current.contains(event.target)) {
        setSugerenciasOrigen([]);
      }
      if (destinoRef.current && !destinoRef.current.contains(event.target)) {
        setSugerenciasDestino([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatDate = (fechaISO: string) => {
    const [year, month, day] = fechaISO.split("T")[0].split("-").map(Number);
    return ` ${String(day).padStart(2, "0")}/${String(month).padStart(
      2,
      "0"
    )}/${year}`;
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":");
    return ` ${hours}:${minutes}`;
  };

  const buscarViajes = async () => {
    if (!origen || !destino) {
      setMensaje("Por favor ingresá ambos campos.");
      return;
    }

    setLoading(true);
    setMensaje("");
    try {
      const data = await listarViajes(origen, destino);
      setViajes(data);
      if (data.length === 0) {
        setMensaje("No se encontraron viajes disponibles.");
      }
    } catch (error) {
      console.log("Error al obtener viajes:", error);
      setMensaje("No se encontraron viajes disponibles !!");
    } finally {
      setLoading(false);
    }
  };

  const filtrarSugerencias = (texto: string, tipo: "origen" | "destino") => {
    const sugerencias = localidades.filter((l) =>
      l.toLowerCase().startsWith(texto.toLowerCase())
    );
    tipo === "origen"
      ? setSugerenciasOrigen(sugerencias)
      : setSugerenciasDestino(sugerencias);
  };

  const renderViaje = (item: Viaje) => (
    <Pressable
      key={item.id}
      onPress={() =>
        router.push({
          pathname: "/pantallas/realizarReserva",
          params: { id: item.id },
        })
      }
      style={styles.card}
    >
      {/* Empresa */}
      {item.MedioTransporte?.Empresa?.nombre && (
        <Text style={styles.nombreEmpresa}>
          {item.MedioTransporte.Empresa.nombre}
        </Text>
      )}

      <View style={styles.fila}>
        {/* Origen → Destino */}
        <Text style={styles.viajeRuta}>
          {item.origenLocalidad} ➜ {item.destinoLocalidad}
        </Text>
        {/* agrege la imagen del icono y un estilo cantPasajeros, no te olvides de la importacion de la imagen **** */}
        <View style={styles.filaPasajeros}>
          <Image
            source={require("../../assets/images/icons8-asiento-50.png")}
            style={styles.iconoAsiento}
          />
          <Text style={styles.cantPasajeros}>{item.cantPasajeros}</Text>
        </View>
      </View>

      {/* Fecha y Horas */}
      <View style={styles.fila}>
        <Text style={styles.filaTexto}>🗓 {formatDate(item.fechaViaje)}</Text>
        <Text style={styles.filaTexto}>
          🕓 {formatTime(item.horarioSalida)} hs
        </Text>
      </View>

      {/* Precio y acción */}
      <View style={styles.filaBottom}>
        <Text style={styles.precio}>
          ARS $
          {item.precio.toLocaleString("es-AR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
        <View style={styles.btnSeleccionar}>
          <Text style={styles.btnSeleccionarText}>Ir a Reservar</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <>
      {Platform.OS === "web" ? (
        //  Web version
        <div style={stylesWeb.container}>
          <div style={stylesWeb.inputsRow}>
            {/* Origen */}
            <div
              ref={origenRef}
              style={{ ...stylesWeb.inputContainerWeb, marginRight: 10 }}
            >
              <input
                style={stylesWeb.inputWeb}
                placeholder="Origen"
                value={origen}
                onChange={(e) => {
                  setOrigen(e.target.value);
                  setMensaje("");
                  setViajes([]);
                  filtrarSugerencias(e.target.value, "origen");
                }}
              />
              {origen.length > 0 && (
                <button
                  onClick={() => {
                    setOrigen("");
                    setMensaje("");
                    setViajes([]);
                    setSugerenciasOrigen([]);
                  }}
                  style={stylesWeb.clearButton}
                >
                  ✕
                </button>
              )}
              {sugerenciasOrigen.length > 0 && (
                <div style={stylesWeb.suggestionBox}>
                  {sugerenciasOrigen.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setOrigen(s);
                        setSugerenciasOrigen([]);
                      }}
                      style={stylesWeb.suggestion}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Destino */}
            <div
              ref={destinoRef}
              style={{ ...stylesWeb.inputContainerWeb, marginRight: 10 }}
            >
              <input
                style={stylesWeb.inputWeb}
                placeholder="Destino"
                value={destino}
                onChange={(e) => {
                  setDestino(e.target.value);
                  setMensaje("");
                  setViajes([]);
                  filtrarSugerencias(e.target.value, "destino");
                }}
              />
              {destino.length > 0 && (
                <button
                  onClick={() => {
                    setDestino("");
                    setMensaje("");
                    setViajes([]);
                    setSugerenciasDestino([]);
                  }}
                  style={stylesWeb.clearButton}
                >
                  ✕
                </button>
              )}
              {sugerenciasDestino.length > 0 && (
                <div style={stylesWeb.suggestionBox}>
                  {sugerenciasDestino.map((s, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setDestino(s);
                        setSugerenciasDestino([]);
                      }}
                      style={stylesWeb.suggestion}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Pressable
              style={[stylesWeb2.button, { marginLeft: 10 }]}
              onPress={buscarViajes}
            >
              <Text style={stylesWeb2.buttonText}>Buscar</Text>
            </Pressable>
          </div>

          {mensaje ? <Text style={stylesWeb2.mensaje}>{mensaje}</Text> : null}

          <div
            style={{ flex: 1, width: "100%", maxHeight: "60vh", marginTop: 20 }}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : (
              <FlatList
                data={viajes}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => renderViaje(item)}
                contentContainerStyle={{ paddingBottom: 16 }}
                scrollEnabled={false} // ya que el scroll lo maneja el div contenedor
              />
            )}
          </div>
        </div>
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ flex: 1, padding: 16 }}>
              {/* Buscador fijo */}
              <View style={styles.searchSection}>
                {/* Origen */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Origen"
                    placeholderTextColor="#888"
                    value={origen}
                    onChangeText={(text) => {
                      setOrigen(text);
                      setMensaje("");
                      setViajes([]);
                      filtrarSugerencias(text, "origen");
                    }}
                    onBlur={() => setSugerenciasOrigen([])}
                  />
                  {origen.length > 0 && (
                    <Pressable
                      onPress={() => {
                        setOrigen("");
                        setMensaje("");
                        setViajes([]);
                        setSugerenciasOrigen([]);
                      }}
                    >
                      <Icon
                        name="times-circle"
                        size={20}
                        color="#aaa"
                        style={styles.clearIcon}
                      />
                    </Pressable>
                  )}
                </View>
                {sugerenciasOrigen.length > 0 && (
                  <View style={styles.suggestionBox}>
                    {sugerenciasOrigen.map((s, idx) => (
                      <Pressable
                        key={idx}
                        onPress={() => {
                          setOrigen(s);
                          setSugerenciasOrigen([]);
                        }}
                      >
                        <Text style={styles.suggestion}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                {/* Destino */}
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Destino"
                    placeholderTextColor="#888"
                    value={destino}
                    onChangeText={(text) => {
                      setDestino(text);
                      setMensaje("");
                      setViajes([]);
                      filtrarSugerencias(text, "destino");
                    }}
                    onBlur={() => setSugerenciasDestino([])}
                  />
                  {destino.length > 0 && (
                    <Pressable
                      onPress={() => {
                        setDestino("");
                        setMensaje("");
                        setViajes([]);
                        setSugerenciasDestino([]);
                      }}
                    >
                      <Icon
                        name="times-circle"
                        size={20}
                        color="#aaa"
                        style={styles.clearIcon}
                      />
                    </Pressable>
                  )}
                </View>
                {sugerenciasDestino.length > 0 && (
                  <View style={styles.suggestionBox}>
                    {sugerenciasDestino.map((s, idx) => (
                      <Pressable
                        key={idx}
                        onPress={() => {
                          setDestino(s);
                          setSugerenciasDestino([]);
                        }}
                      >
                        <Text style={styles.suggestion}>{s}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}

                <Pressable style={styles.button} onPress={buscarViajes}>
                  <Text style={styles.buttonText}>Buscar</Text>
                </Pressable>

                {mensaje ? <Text style={styles.mensaje}>{mensaje}</Text> : null}
              </View>

              {/* Lista de viajes scrollable */}
              <View style={{ flex: 1 }}>
                {loading ? (
                  <ActivityIndicator
                    size="large"
                    color="#007AFF"
                    style={{ marginTop: 20 }}
                  />
                ) : (
                  <FlatList
                    data={viajes}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => renderViaje(item)}
                    contentContainerStyle={{ paddingBottom: 16 }}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  container: {
    padding: 16,
    backgroundColor: "#fff",
  },
  searchSection: {
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#007AFF",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  clearIcon: {
    marginLeft: 8,
  },
  suggestionBox: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 12,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ddd",
    color: "black",
    fontWeight: "bold",
  },
  button: {
    padding: 14,
    marginBottom: 16,
    backgroundColor: "#4c68d7",
    paddingVertical: 12,
    paddingHorizontal: 20,
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
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  mensaje: {
    textAlign: "center",
    color: "#ff3333",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  detail: {
    fontSize: 14,
    fontWeight: "normal",
    marginBottom: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
  },
  cardTitle: {
    fontWeight: "bold",
    marginBottom: 6,
    color: "#007AFF",
  },
  nombreEmpresa: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4c68d7",
    marginBottom: 4,
  },
  filaPasajeros: {
    flexDirection: "row",
    alignItems: "center",
  },
  cantPasajeros: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  viajeRuta: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },

  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  filaTexto: {
    fontSize: 14,
    color: "#555",
  },

  filaBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },

  precio: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },

  btnSeleccionar: {
    backgroundColor: "#4c68d7",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  btnSeleccionarText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  iconoAsiento: {
    width: 18,
    height: 18,
    marginRight: 4,
  },
});

const stylesWeb2 = StyleSheet.create({
  button: {
    backgroundColor: "#007AFF",
    padding: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
    marginTop: -11,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  mensaje: {
    marginTop: 16,
    color: "red",
    fontWeight: "500",
  },
  container: {
    flex: 1,
    padding: 40,
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    position: "relative",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  inputsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },
});
const stylesWeb: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    flexDirection: "column",
    padding: 40,
    alignItems: "center",
    backgroundColor: "#f2f2f2",
    overflowY: "auto",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },
  inputsRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },
  inputContainerWeb: {
    position: "relative",
    marginBottom: 12,
    width: 250,
  },
  inputWeb: {
    width: "100%",
    padding: 10,
    border: "1px solid #ccc",
    borderRadius: 8,
    fontSize: 16,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 5,
    backgroundColor: "transparent",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
  },
  suggestionBox: {
    position: "absolute",
    top: 48,
    width: "100%",
    backgroundColor: "#fff",
    zIndex: 1000,
    border: "1px solid #ddd",
    borderRadius: 6,
    maxHeight: 200,
    overflowY: "auto",
  },
  suggestion: {
    padding: 10,
    borderBottom: "1px solid #ddd",
    color: "black",
    cursor: "pointer",
    fontFamily: "sans-serif",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: "10px 30px",
    borderRadius: 8,
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    cursor: "pointer",
    border: "none",
    marginTop: 0,
    alignSelf: "flex-end",
    height: 45,
  },
  mensaje: {
    marginTop: 16,
    color: "red",
    fontWeight: 500,
  },
};
