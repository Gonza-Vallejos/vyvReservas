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

  if (userInfo?.perfil !== "usuarioCliente") {
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
      const data = await listarViajes(o.trim(), d.trim());
      setViajes(data);
      setHasSearched(true);
      if (data.length === 0) {
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
      pathname: "/pantallas/realizarReserva",
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
        <View style={styles.routeSummary}>
          <Text allowFontScaling style={[styles.routeText, { color: text }]}>
            {origen} <Text style={{ color: textSecondary }}>→</Text> {destino}
          </Text>
        </View>
      )}

      <DateSelectorBar selectedDate={fecha} onSelectDate={handleSelectDate} />
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
  routeSummary: {
    marginBottom: 12,
    alignItems: "center",
  },
  routeText: {
    fontSize: 18,
    fontWeight: "800",
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
