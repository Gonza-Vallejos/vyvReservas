import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { Redirect } from "expo-router";
import { listarViajes } from "../../services/viajeServices";
import { useThemeColor } from "@/components/Themed";
import SearchForm from "@/components/ui/SearchForm";
import DateSelectorBar from "@/components/ui/DateSelectorBar";
import TripCard from "@/components/ui/TripCard";
import EmptyState from "@/components/ui/EmptyState";
import Card from "@/components/ui/Card";

import type { Trip as Viaje } from "@/components/ui/TripCard";

const formatISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export default function ViajesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { userInfo } = useAuth();

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const background = useThemeColor({}, "background");
  const primary = useThemeColor({}, "primary");
  const success = useThemeColor({}, "success");

  const initialOrigen = typeof params.origen === "string" ? params.origen : "";
  const initialDestino = typeof params.destino === "string" ? params.destino : "";
  const initialFecha = typeof params.fecha === "string" ? params.fecha : formatISODate(new Date());

  const [viajes, setViajes] = useState<Viaje[]>([]);
  const [origen, setOrigen] = useState(initialOrigen);
  const [destino, setDestino] = useState(initialDestino);
  const [fecha, setFecha] = useState(initialFecha);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const isCliente =
    !userInfo ||
    userInfo.perfil === "usuarioCliente" ||
    userInfo.perfil === "cliente" ||
    userInfo.perfil_id === 2;

  if (!isCliente) {
    return <Redirect href="/(tabs)" />;
  }

  const buscarViajes = useCallback(async (
    o: string = origen,
    d: string = destino,
    f: string = fecha
  ) => {
    if (!o.trim() || !d.trim()) {
      setMensaje("Por favor ingresá origen y destino.");
      return;
    }

    setLoading(true);
    setMensaje("");
    Keyboard.dismiss();

    try {
      const data = await listarViajes(o.trim(), d.trim(), f?.trim());
      const list = Array.isArray(data) ? data : (data as any)?.data || [];
      setViajes(list);
      setHasSearched(true);
      if (list.length === 0) {
        setMensaje("No se encontraron viajes disponibles para esta ruta y fecha.");
      }
    } catch (error) {
      console.log("Error al obtener viajes:", error);
      setMensaje("No se pudieron cargar los viajes. Intentá de nuevo.");
      setViajes([]);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  }, [origen, destino, fecha]);

  useEffect(() => {
    if (initialOrigen && initialDestino) {
      buscarViajes(initialOrigen, initialDestino, initialFecha);
    }
  }, []);

  const handleSearch = (params: { origen: string; destino: string; fecha: string }) => {
    setOrigen(params.origen);
    setDestino(params.destino);
    setFecha(params.fecha);
    buscarViajes(params.origen, params.destino, params.fecha);
  };

  const handleSelectDate = (newDate: string) => {
    setFecha(newDate);
    if (origen && destino) {
      buscarViajes(origen, destino, newDate);
    }
  };

  const handleSelectTrip = (trip: Viaje) => {
    router.push({
      pathname: "/pantallas/detalleViaje" as any,
      params: { id: trip.id },
    });
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Card style={styles.searchCard}>
        <SearchForm
          onSearch={handleSearch}
          isLoading={loading}
          initialValues={{ origen, destino, fecha }}
        />
      </Card>

      {hasSearched && origen && destino && (
        <>
          <View style={styles.resultsHeader}>
            <View style={styles.resultsTitleRow}>
              <Text allowFontScaling style={[styles.resultsCount, { color: text }]}>
                {loading
                  ? "Consultando salidas..."
                  : `${viajes.length} ${viajes.length === 1 ? "servicio encontrado" : "servicios encontrados"}`}
              </Text>
              {!loading && viajes.length > 0 && (
                <View style={[styles.statusDot, { backgroundColor: success }]} />
              )}
            </View>
            <Text allowFontScaling style={[styles.routeText, { color: textSecondary }]}>
              {origen} → {destino}
            </Text>
          </View>
          <DateSelectorBar selectedDate={fecha} onSelectDate={handleSelectDate} />
        </>
      )}

      {!hasSearched && <DateSelectorBar selectedDate={fecha} onSelectDate={handleSelectDate} />}
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={primary} />
          <Text
            allowFontScaling
            style={[styles.loadingText, { color: textSecondary }]}
          >
            Buscando viajes...
          </Text>
        </View>
      );
    }

    if (mensaje && viajes.length === 0) {
      return (
        <EmptyState
          icon="bus-outline"
          title="No encontramos viajes"
          description={mensaje}
          action={{
            label: "Limpiar búsqueda",
            onPress: () => {
              setOrigen("");
              setDestino("");
              setFecha(formatISODate(new Date()));
              setViajes([]);
              setMensaje("");
              setHasSearched(false);
            },
            variant: "secondary",
          }}
        />
      );
    }

    if (viajes.length === 0 && !hasSearched) {
      return (
        <EmptyState
          icon="search-outline"
          title="Buscá tu próximo viaje"
          description="Ingresá origen, destino y fecha para ver las salidas disponibles."
        />
      );
    }

    return null;
  };

  return (
    <KeyboardAvoidingView
      style={[styles.keyboardView, { backgroundColor: background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container, { backgroundColor: background }]}>
          <FlatList
            data={viajes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TripCard trip={item} onSelect={handleSelectTrip} />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderContent}
          />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerSection: {
    marginBottom: 8,
  },
  searchCard: {
    marginBottom: 16,
  },
  resultsHeader: {
    marginBottom: 12,
    gap: 4,
  },
  resultsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultsCount: {
    fontSize: 18,
    fontWeight: "800",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  center: {
    paddingVertical: 40,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
});
