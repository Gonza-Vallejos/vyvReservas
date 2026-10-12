import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { obtenerViajesPorChofer } from "../../services/viajeServices";
import { useAuth } from "@/context/AuthContext";

interface Empresa {
  id: number;
  nombre: string;
}

interface MedioTransporte {
  id: number;
  nombre: string;
  Empresa: Empresa;
}

interface UsuarioEmpresa {
  Empresa: Empresa;
}

interface Viaje {
  id: number;
  origenLocalidad: string;
  destinoLocalidad: string;
  horarioSalida: string;
  fechaViaje: string;
  precio: number;
  UsuarioEmpresa: UsuarioEmpresa;
  MedioTransporte: MedioTransporte;
}

const ViajesChofer = () => {
  const [viajes, setViajes] = useState<Viaje[]>([]);
  const { logout, userInfo } = useAuth();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  if (userInfo?.perfil !== "usuarioChofer") {
    logout();
    return <Redirect href="/login" />;
  }

  useEffect(() => {
    const fetchViajes = async () => {
      try {
        setLoading(true);
        const data = await obtenerViajesPorChofer(userInfo?.id);
        console.log("ver data viajes ", data.viajes);
        setViajes(data.viajes);
      } catch (error) {
        console.error("Error al obtener viajes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchViajes();
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

  // Filtrar y clasificar los viajes
  const fechaActual = new Date();
  const fechaActualLimpia = limpiarHoraUTC(fechaActual);
  const horaActualMinutos =
    fechaActual.getHours() * 60 + fechaActual.getMinutes();

  function limpiarHoraUTC(fecha: any) {
    const isoStr = fecha.toISOString(); // ejemplo: "2025-06-27T00:00:00.000Z"
    const [anio, mes, dia] = isoStr.substring(0, 10).split("-");
    return new Date(Number(anio), Number(mes) - 1, Number(dia));
  }

  const viajesPasados = viajes.filter((v) => {
    const fechaViajeLimpia = limpiarHoraUTC(new Date(v.fechaViaje));
    const [h, m] = v.horarioSalida.split(":").map(Number);
    const horaViajeMinutos = h * 60 + m;

    if (fechaActualLimpia > fechaViajeLimpia) {
      return true; // la fecha ya pasó
    }

    if (fechaActualLimpia.getTime() === fechaViajeLimpia.getTime()) {
      return horaActualMinutos > horaViajeMinutos; // misma fecha, hora ya pasó
    }

    return false; // fecha futura
  });

  const viajesFuturos = viajes.filter((v) => {
    const fechaViajeLimpia = limpiarHoraUTC(new Date(v.fechaViaje));
    const [h, m] = v.horarioSalida.split(":").map(Number);
    const horaViajeMinutos = h * 60 + m;

    if (fechaActualLimpia < fechaViajeLimpia) {
      return true; // fecha aún no llegó
    }

    if (fechaActualLimpia.getTime() === fechaViajeLimpia.getTime()) {
      return horaActualMinutos <= horaViajeMinutos; // misma fecha, aún no es la hora
    }

    return false; // fecha ya pasó
  });
  console.log("ver viajes futuros ", viajesFuturos);
  console.log("ver viajes pasados ", viajesPasados);

  const renderViajeChofer = (item: Viaje) => (
    <Pressable
      key={item.id}
      onPress={() =>
        router.push({
          pathname: "/pantallas/choferListaPasajeros",
          params: {
            id: item.id,
            origen: item.origenLocalidad,
            destino: item.destinoLocalidad,
          },
        })
      }
      style={styles.viajeCard}
    >
      {/* Empresa */}
      {item.MedioTransporte?.Empresa?.nombre && (
        <Text style={styles.nombreEmpresa}>
          {item.MedioTransporte.Empresa.nombre}
        </Text>
      )}

      {/* Origen → Destino */}
      <Text style={styles.viajeRuta}>
        {item.origenLocalidad} ➜ {item.destinoLocalidad}
      </Text>

      {/* Fecha y Hora */}
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
          <Text style={styles.btnSeleccionarText}>Ver Pasajeros</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          {/* VIAJES FUTUROS */}
          {viajesFuturos.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Próximos viajes</Text>
              {viajesFuturos.map(renderViajeChofer)}
            </>
          )}

          {/* VIAJES PASADOS */}
          {viajesPasados.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Viajes realizados</Text>
              {viajesPasados.map(renderViajeChofer)}
            </>
          )}

          {/* NINGÚN VIAJE */}
          {viajesFuturos.length === 0 && viajesPasados.length === 0 && (
            <Text style={styles.mensaje}>No hay Viajes para este Chofer.</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 15,
  },
  scrollContainer: {
    paddingBottom: 24,
  },
  mensaje: {
    textAlign: "center",
    color: "#b2babb",
    marginTop: 40,
    fontSize: 16,
  },
  viajeCard: {
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
  },
  nombreEmpresa: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4c68d7",
    marginBottom: 4,
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
  sectionTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: "#34495e",
    marginBottom: 14,
    textAlign: "left",
    borderBottomWidth: 2,
    borderBottomColor: "#4c68d7",
    paddingBottom: 6,
  },
});

export default ViajesChofer;
