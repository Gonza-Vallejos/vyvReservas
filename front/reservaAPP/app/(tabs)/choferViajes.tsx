import React, { useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from "react-native";
import { Redirect, useRouter } from "expo-router";
import { obtenerViajesPorChofer } from "../../services/viajeServices";
import { useAuth } from "@/context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import ScreenContainer from "@/components/ui/ScreenContainer";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import {
  formatDate,
  formatTime,
  formatCurrency,
  isTripFuture,
} from "@/utils/dateFormatter";
import { useThemeColor } from "@/components/Themed";

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
  const router = useRouter();
  const { userInfo } = useAuth();
  const textSecondary = useThemeColor({}, "textSecondary");

  if (userInfo?.perfil !== "usuarioChofer") {
    return <Redirect href="/(tabs)" />;
  }

  const fetchViajes = useCallback(
    () => obtenerViajesPorChofer(userInfo?.id).then((res) => res.viajes || []),
    [userInfo?.id]
  );

  const { data: viajes = [], loading, error, refetch, setData } = useAsyncData<Viaje[]>({
    fetchFn: fetchViajes,
    dependencies: [userInfo?.id],
  });

  const { viajesFuturos, viajesPasados } = useMemo(() => {
    const futuros: Viaje[] = [];
    const pasados: Viaje[] = [];
    viajes.forEach((v) => {
      if (isTripFuture(v.fechaViaje, v.horarioSalida)) {
        futuros.push(v);
      } else {
        pasados.push(v);
      }
    });
    return { viajesFuturos: futuros, viajesPasados: pasados };
  }, [viajes]);

  const handleSelectTrip = (item: Viaje) => {
    router.push({
      pathname: "/pantallas/choferListaPasajeros",
      params: {
        id: item.id,
        origen: item.origenLocalidad,
        destino: item.destinoLocalidad,
      },
    });
  };

  const renderViajeCard = (item: Viaje) => (
    <Pressable
      key={item.id}
      onPress={() => handleSelectTrip(item)}
      accessibilityRole="button"
      accessibilityLabel={`Viaje de ${item.origenLocalidad} a ${item.destinoLocalidad}`}
    >
      <Card style={styles.viajeCard}>
        {item.MedioTransporte?.Empresa?.nombre && (
          <Badge variant="primary" style={styles.empresaBadge}>
            {item.MedioTransporte.Empresa.nombre}
          </Badge>
        )}

        <Text style={styles.viajeRuta}>
          {item.origenLocalidad} ➜ {item.destinoLocalidad}
        </Text>

        <View style={styles.fila}>
          <Text style={[styles.filaTexto, { color: textSecondary }]}>
            🗓 {formatDate(item.fechaViaje)}
          </Text>
          <Text style={[styles.filaTexto, { color: textSecondary }]}>
            🕓 {formatTime(item.horarioSalida)} hs
          </Text>
        </View>

        <View style={styles.filaBottom}>
          <Text style={styles.precio}>{formatCurrency(item.precio)}</Text>
          <Button variant="primary" size="sm" onPress={() => handleSelectTrip(item)}>
            Ver Pasajeros
          </Button>
        </View>
      </Card>
    </Pressable>
  );

  return (
    <ScreenContainer
      loading={loading}
      error={error}
      onRetry={refetch}
      refreshing={loading}
      onRefresh={refetch}
      contentContainerStyle={styles.scrollContainer}
    >
      {viajesFuturos.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Próximos viajes</Text>
          {viajesFuturos.map(renderViajeCard)}
        </>
      )}

      {viajesPasados.length > 0 && (
        <>
          <Text style={[styles.sectionTitle, styles.sectionTitlePast]}>
            Viajes realizados
          </Text>
          {viajesPasados.map(renderViajeCard)}
        </>
      )}

      {viajesFuturos.length === 0 && viajesPasados.length === 0 && !loading && (
        <Text style={styles.mensaje}>No hay viajes para este chofer.</Text>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  mensaje: {
    textAlign: "center",
    color: "#b2babb",
    marginTop: 40,
    fontSize: 16,
  },
  viajeCard: {
    marginBottom: 16,
    borderLeftWidth: 6,
    borderLeftColor: "#4c68d7",
  },
  empresaBadge: {
    marginBottom: 8,
  },
  viajeRuta: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  filaTexto: {
    fontSize: 14,
  },
  filaBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  precio: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#34495e",
    marginBottom: 14,
    textAlign: "left",
    borderBottomWidth: 2,
    borderBottomColor: "#4c68d7",
    paddingBottom: 6,
  },
  sectionTitlePast: {
    marginTop: 24,
    borderBottomColor: "#94a3b8",
  },
});

export default ViajesChofer;
