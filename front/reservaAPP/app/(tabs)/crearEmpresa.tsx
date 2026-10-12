import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { crearEmpresa } from "@/services/empresaService";
import { obtenerLocalidades } from "../../services/viajeServices";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuth } from "../../context/AuthContext";

type Localidad = {
  id: number;
  nombre: string;
};

const CrearEmpresa = () => {
  const [nombre, setNombre] = useState("");
  const [direccion, setDireccion] = useState("");
  const [cuit, setCuit] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [localidades, setLocalidades] = useState<Localidad[]>([]);
  const [localidadInput, setLocalidadInput] = useState("");
  const [localidadId, setLocalidadId] = useState<number | null>(null);
  const [sugerencias, setSugerencias] = useState<Localidad[]>([]);
  const [erroresCampo, setErroresCampo] = useState<Record<string, string>>({});

  const inputRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { logout, userInfo } = useAuth();

  if (userInfo?.perfil !== "usuarioAdministrador") {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const cargarLocalidades = async () => {
      try {
        const data = await obtenerLocalidades();
        setLocalidades(data);
      } catch (e) {
        console.error("Error al cargar localidades", e);
      }
    };

    cargarLocalidades();

    if (Platform.OS === "web") {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setSugerencias([]);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, []);

  const filtrarLocalidades = (texto: string) => {
    const sugerenciasFiltradas = localidades.filter((l) =>
      l.nombre.toLowerCase().startsWith(texto.toLowerCase())
    );
    setSugerencias(sugerenciasFiltradas);
  };

  const handleGuardar = async () => {
    setErroresCampo({});

    if (!nombre || !direccion || !cuit || !telefono || !email || !localidadId) {
      const mensaje = "Por favor, completa todos los campos";
      Platform.OS === "web" ? alert(mensaje) : Alert.alert(mensaje);
      return;
    }

    try {
      const nuevaEmpresa = {
        nombre,
        direccion,
        cuit,
        telefono,
        email,
        localidad_id: localidadId,
      };

      await crearEmpresa(nuevaEmpresa);

      const mensaje = "Empresa creada correctamente";
      Platform.OS === "web" ? alert(mensaje) : Alert.alert(mensaje);

      setNombre("");
      setDireccion("");
      setCuit("");
      setTelefono("");
      setEmail("");
      setLocalidadInput("");
      setLocalidadId(null);
      setSugerencias([]);
      setErroresCampo({});
      router.back();
    } catch (error: any) {
      const errores = error?.response?.data?.errores;
      if (errores && Array.isArray(errores)) {
        const erroresPorCampo: Record<string, string> = {};
        errores.forEach((err: any) => {
          erroresPorCampo[err.path] = err.msg;
        });

        setErroresCampo(erroresPorCampo);
        const mensajeError = "Por favor, corrige los errores en el formulario.";
        Platform.OS === "web" ? alert(mensajeError) : Alert.alert(mensajeError);
      } else {
        const mensajeError =
          error?.response?.data?.error || "Error al crear la empresa.";
        Platform.OS === "web"
          ? alert("Error: " + mensajeError)
          : Alert.alert("Error", mensajeError);
      }
    }
  };

  return (
    <KeyboardAwareScrollView
      style={styles.container}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={120} // espacio adicional para evitar superposición
    >
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        placeholderTextColor="#888"
        value={nombre}
        onChangeText={(text) => {
          setNombre(text);
          setErroresCampo((prev) => ({ ...prev, nombre: "" }));
        }}
      />
      {erroresCampo.nombre && (
        <Text style={styles.errorTexto}>{erroresCampo.nombre}</Text>
      )}

      <Text style={styles.label}>Dirección</Text>
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        placeholderTextColor="#888"
        value={direccion}
        onChangeText={(text) => {
          setDireccion(text);
          setErroresCampo((prev) => ({ ...prev, direccion: "" }));
        }}
      />
      {erroresCampo.direccion && (
        <Text style={styles.errorTexto}>{erroresCampo.direccion}</Text>
      )}

      <Text style={styles.label}>CUIT</Text>
      <TextInput
        style={styles.input}
        placeholder="CUIT"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={cuit}
        onChangeText={(text) => {
          setCuit(text);
          setErroresCampo((prev) => ({ ...prev, cuit: "" }));
        }}
      />
      {erroresCampo.cuit && (
        <Text style={styles.errorTexto}>{erroresCampo.cuit}</Text>
      )}

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        placeholderTextColor="#888"
        keyboardType="phone-pad"
        value={telefono}
        onChangeText={(text) => {
          setTelefono(text);
          setErroresCampo((prev) => ({ ...prev, telefono: "" }));
        }}
      />
      {erroresCampo.telefono && (
        <Text style={styles.errorTexto}>{erroresCampo.telefono}</Text>
      )}

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        keyboardType="email-address"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setErroresCampo((prev) => ({ ...prev, email: "" }));
        }}
      />
      {erroresCampo.email && (
        <Text style={styles.errorTexto}>{erroresCampo.email}</Text>
      )}

      <Text style={styles.label}>Localidad</Text>
      {Platform.OS === "web" ? (
        <div ref={inputRef} style={inputContainerWeb}>
          <input
            style={inputStyleWeb}
            placeholder="Buscar localidad"
            value={localidadInput}
            onChange={(e) => {
              setLocalidadInput(e.target.value);
              filtrarLocalidades(e.target.value);
              setLocalidadId(null);
              setErroresCampo((prev) => ({ ...prev, localidad_id: "" }));
            }}
          />
          {localidadInput && (
            <button
              onClick={() => {
                setLocalidadInput("");
                setLocalidadId(null);
                setSugerencias([]);
                setErroresCampo((prev) => ({ ...prev, localidad_id: "" }));
              }}
              style={clearButtonWeb}
            >
              ✕
            </button>
          )}
          {sugerencias.length > 0 && (
            <div style={suggestionBoxWeb}>
              {sugerencias.map((l) => (
                <div
                  key={l.id}
                  onClick={() => {
                    setLocalidadInput(l.nombre);
                    setLocalidadId(l.id);
                    setSugerencias([]);
                    setErroresCampo((prev) => ({ ...prev, localidad_id: "" }));
                  }}
                  style={suggestionWeb}
                >
                  {l.nombre}
                </div>
              ))}
            </div>
          )}
          {erroresCampo.localidad_id && (
            <Text style={styles.errorTexto}>{erroresCampo.localidad_id}</Text>
          )}
        </div>
      ) : (
        <>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholderTextColor="#888"
              placeholder="Buscar localidad"
              value={localidadInput}
              onChangeText={(text) => {
                setLocalidadInput(text);
                filtrarLocalidades(text);
                setLocalidadId(null);
                setErroresCampo((prev) => ({ ...prev, localidad_id: "" }));
              }}
              onBlur={() => setSugerencias([])}
            />
            {localidadInput.length > 0 && (
              <Pressable
                onPress={() => {
                  setLocalidadInput("");
                  setLocalidadId(null);
                  setSugerencias([]);
                  setErroresCampo((prev) => ({ ...prev, localidad_id: "" }));
                }}
                style={styles.clearIconContainer}
              >
                <Text style={{ fontSize: 18, color: "#aaa" }}>✕</Text>
              </Pressable>
            )}
          </View>
          {erroresCampo.localidad_id && (
            <Text style={styles.errorTexto}>{erroresCampo.localidad_id}</Text>
          )}
          {sugerencias.length > 0 && (
            <View style={styles.suggestionBox}>
              {sugerencias.map((l) => (
                <Pressable
                  key={l.id}
                  onPress={() => {
                    setLocalidadInput(l.nombre);
                    setLocalidadId(l.id);
                    setSugerencias([]);
                    setErroresCampo((prev) => ({ ...prev, localidad_id: "" }));
                  }}
                >
                  <Text style={styles.suggestion}>{l.nombre}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </>
      )}

      <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
        <Text style={styles.botonTexto}>Guardar Empresa</Text>
      </TouchableOpacity>

      <View style={{ height: 100 }} />
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 4,
    color: "black"
  },
  inputContainer: {
    position: "relative",
  },
  clearIconContainer: {
    position: "absolute",
    right: 10,
    top: 12,
  },
  suggestionBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 150,
    zIndex: 10,
  },
  suggestion: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  botonGuardar: {
    marginTop: 20,
    backgroundColor: "#4c68d7",
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: "center",
    paddingHorizontal: 30,
    alignSelf: "center",
  },
  botonTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  errorTexto: {
    color: "red",
    fontSize: 13,
    marginBottom: 8,
  },
});

// Estilos Web
const inputStyleWeb: React.CSSProperties = {
  width: "100%",
  padding: 10,
  fontSize: 16,
  borderRadius: 8,
  border: "1px solid #ccc",
  marginBottom: 4,
};

const inputContainerWeb: React.CSSProperties = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 12,
  position: "relative",
  width: "98%",
};

const suggestionBoxWeb: React.CSSProperties = {
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: 8,
  marginTop: 4,
  maxHeight: 150,
  overflowY: "scroll",
  zIndex: 999,
  position: "absolute",
  width: "100%",
};

const suggestionWeb: React.CSSProperties = {
  padding: 10,
  borderBottom: "1px solid #eee",
  cursor: "pointer",
  fontFamily: "Arial",
};

const clearButtonWeb: React.CSSProperties = {
  position: "absolute",
  right: -15,
  top: 9,
  background: "none",
  border: "none",
  fontSize: 16,
  cursor: "pointer",
};

export default CrearEmpresa;
