import React, { useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Button from "@/components/ui/Button";

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
  empresa?: any;
}

interface DataComprobante extends VentaDetalleGeneral {
  usuario: Usuario;
}

export default function DetalleVenta() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { isLoading, userInfo } = useAuth();

  if (!isLoading && !userInfo) {
    return <Redirect href="/login" />;
  }

  const fetchData = useCallback(async () => {
    if (!userInfo?.id) throw new Error("Usuario no autenticado");
    const [venta, usuarioArray] = await Promise.all([
      obtenerVentaDetalle(Number(id)),
      obtenerUsuarioPorId(userInfo.id),
    ]);
    const usuario = Array.isArray(usuarioArray) ? usuarioArray[0] : usuarioArray;
    return { ...venta, usuario, empresa: venta.empresa } as DataComprobante;
  }, [id, userInfo?.id]);

  const { data, loading, error, refetch } = useAsyncData<DataComprobante>({
    fetchFn: fetchData,
    dependencies: [id, userInfo?.id],
    enabled: !!userInfo?.id,
  });

  const handleDownload = async () => {
    if (!data) return;

    const htmlContent = generarHTMLComprobante(data);

    try {
      if (Platform.OS === "web") {
        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>Comprobante</title></head>
              <body>${htmlContent}</body>
            </html>
          `);
          newWindow.document.close();
          newWindow.onload = () => newWindow.print();
        }
      } else {
        const { uri } = await Print.printToFileAsync({ html: htmlContent });
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo generar el comprobante.");
      console.error(error);
    }
  };

  return (
    <ScreenContainer
      loading={loading || isLoading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      scrollEnabled
      contentContainerStyle={styles.scrollContent}
    >
      {data && (
        <>
          <Text style={styles.successMessage}>✅ ¡Compra realizada con éxito!</Text>

          {Platform.OS === "web" ? (
            <div
              style={styles.webReceipt}
              dangerouslySetInnerHTML={{ __html: generarHTMLComprobante(data) }}
            />
          ) : (
            <View style={styles.webviewContainer}>
              <WebView
                originWhitelist={["*"]}
                source={{ html: generarHTMLComprobante(data) }}
                style={styles.webview}
              />
            </View>
          )}

          <Button
            variant="primary"
            size="lg"
            icon="download-outline"
            onPress={handleDownload}
          >
            Descargar Comprobante
          </Button>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    backgroundColor: "#f5f5f5",
    alignItems: "center",
    flexGrow: 1,
  },
  successMessage: {
    fontSize: 18,
    color: "#28a745",
    fontWeight: "bold",
    marginBottom: 16,
  },
  webReceipt: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  webviewContainer: {
    flex: 1,
    height: 600,
    width: "100%",
    marginBottom: 16,
  },
  webview: {
    flex: 1,
  },
});
