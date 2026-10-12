import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Button,
  Alert,
  Platform,
} from "react-native";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import { obtenerVentaDetalle } from "../../services/ventaService";
import { obtenerUsuarioPorId } from "../../services/usuarioService";
import { generarHTMLComprobante } from "../../utils/imprimirComprobante";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useAuth } from "@/context/AuthContext";
import { WebView } from "react-native-webview";

export default function DetalleVenta() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [data, setData] = useState<DataComprobante | null>(null);
  const [loading, setLoading] = useState(true);

  interface Pasajero {
    id: number;
    nombre: string;
    apellido: string;
    dni: number;
    ubicacionOrigen: string;
    ubicacionDestino: string;
  }

  interface Usuario {
    id: number;
    usuario: string;

    email?: string;
  }

  interface VentaDetalleGeneral {
    id: number;
    origenLocalidad: string;
    destinoLocalidad: string;
    horarioSalida: string;
    fechaViaje: string;
    precio: number;
    chofer: string;
    medioTransporte_id: number;
    pasajeros: Pasajero[];
    fecha: string;
    hora: string;
    totalVentas: number;
    reserva_id: number;
    formaPago: string | null;
    subTotal: number | null;
    descuento: number | null;
    precioFinal: number | null;
    ventas_id: number;
  }

  interface DataComprobante extends VentaDetalleGeneral {
    usuario: Usuario;
  }
  const { isLoading, logout, userInfo } = useAuth();

  useEffect(() => {
    if (id && userInfo?.id) {
      setLoading(true);
      Promise.all([
        obtenerVentaDetalle(Number(id)),
        obtenerUsuarioPorId(userInfo.id),
      ])
        .then(([venta, usuarioArray]) => {
          const usuario = Array.isArray(usuarioArray)
            ? usuarioArray[0]
            : usuarioArray;
          setData({ ...venta, usuario, empresa: venta.empresa });
        })

        .catch((error) => {
          console.error("Error al obtener datos:", error);
        })
        .finally(() => setLoading(false));
    }
  }, [id, userInfo]);

  useEffect(() => {
    if (!isLoading && userInfo?.perfil !== "usuarioCliente") {
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

  const handleDownload = async () => {
    if (!data) return;

    const htmlContent = generarHTMLComprobante(data);

    try {
      if (Platform.OS === "web") {
        // En web, abrimos una ventana con el comprobante
        const newWindow = window.open("", "_blank");
        if (newWindow) {
          // Escribimos un HTML completo
          newWindow.document.write(`
        <html>
          <head>
            <title>Comprobante</title>
            <style>
              ${/* Forzamos un CSS para impresión */ ""}
              * {
                box-sizing: border-box;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact; /* Forza colores */
                  color-adjust: exact;
                }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `);
          newWindow.document.close();

          // Espera a que cargue el contenido antes de imprimir
          newWindow.onload = () => {
            newWindow.print();
          };
        }
      } else {
        // En móvil usamos expo-print
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el comprobante.");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!data) {
    return (
      <View style={styles.container}>
        <Text>No hay detalles disponibles.</Text>
      </View>
    );
  }

  const {
    origenLocalidad,
    destinoLocalidad,
    horarioSalida,
    fechaViaje,
    pasajeros,
    fecha,
    hora,
    subTotal,
    descuento,
    precioFinal,
    formaPago,
    usuario,
  } = data;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.scrollContent}
    >
      <Text style={styles.successMessage}>✅ ¡Compra realizada con éxito!</Text>

      {Platform.OS === "web" ? (
        <div
          style={{
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: 8,
            overflow: "hidden",
            marginBottom: 20,
          }}
          dangerouslySetInnerHTML={{ __html: generarHTMLComprobante(data) }}
        />
      ) : (
        <View style={{ flex: 1, height: 600, width: "100%" }}>
          <WebView
            originWhitelist={["*"]}
            source={{ html: generarHTMLComprobante(data) }}
            style={{ flex: 1 }}
          />
        </View>
      )}

      <Button title="📥 Descargar Comprobante" onPress={handleDownload} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  scrollContent: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
  },
  successMessage: {
    fontSize: 18,
    color: "#28a745",
    fontWeight: "bold",
    marginBottom: 16,
  },
  receipt: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    elevation: 3,
  },
  receiptTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginVertical: 10,
  },
  innerSeparator: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    marginVertical: 6,
  },
  receiptText: {
    fontSize: 16,
    color: "#333",
  },
  pasajeroItem: {
    marginBottom: 8,
  },
  footer: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 16,
    fontStyle: "italic",
    color: "#555",
  },
  viajeBox: {
    backgroundColor: "#e6f0ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  viajeText: {
    fontSize: 16,
    color: "#004080",
    marginBottom: 4,
    fontWeight: "600",
  },
  subTotal: {
    fontSize: 16,
    color: "#666",
    marginTop: 6,
  },
  totalFinal: {
    fontSize: 18,
    color: "#d9534f",
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
});
