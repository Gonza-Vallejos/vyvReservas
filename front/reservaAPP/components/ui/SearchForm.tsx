import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  FlatList,
  Keyboard,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { obtenerLocalidades } from "../../services/viajeServices";
import { useThemeColor } from "../Themed";
import InputField from "./InputField";
import Button from "./Button";

const CIUDADES_DEFAULT = [
  "Corrientes",
  "San Roque",
  "Goya",
  "Mercedes",
  "Bella Vista",
  "Curuzú Cuatiá",
  "Paso de los Libres",
  "Ituzaingó",
  "Saladas",
  "Santa Lucía",
  "Esquina",
  "Monte Caseros",
  "Resistencia",
  "Posadas",
];

const formatISODate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const hoy = () => formatISODate(new Date());

interface SearchFormProps {
  onSearch: (params: { origen: string; destino: string; fecha: string }) => void;
  isLoading?: boolean;
  initialValues?: {
    origen?: string;
    destino?: string;
    fecha?: string;
  };
}

export default function SearchForm({
  onSearch,
  isLoading = false,
  initialValues,
}: SearchFormProps) {
  const [origen, setOrigen] = useState(initialValues?.origen || "");
  const [destino, setDestino] = useState(initialValues?.destino || "");
  const [fecha, setFecha] = useState(initialValues?.fecha || hoy());

  const [localidades, setLocalidades] = useState<string[]>(CIUDADES_DEFAULT);
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState<string[]>([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState<string[]>([]);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);

  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");
  const surface = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");
  const error = useThemeColor({}, "error");
  const surfaceElevated = useThemeColor({}, "surfaceElevated");

  useEffect(() => {
    let isMounted = true;
    const fetchLocalidades = async () => {
      try {
        const data = await obtenerLocalidades();
        if (!isMounted) return;
        const locationsArray = Array.isArray(data) ? data : data.data || [];
        if (locationsArray.length > 0) {
          const nombres = locationsArray
            .map((l: any) => (typeof l === "string" ? l : l.nombre))
            .filter(Boolean);
          const combinadas = Array.from(new Set([...nombres, ...CIUDADES_DEFAULT]));
          setLocalidades(combinadas);
        }
      } catch {
        console.warn("Usando localidades por defecto:", CIUDADES_DEFAULT);
      }
    };
    fetchLocalidades();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtrarCiudades = useCallback(
    (query: string) => {
      if (!query || query.trim().length === 0) return [];
      const q = query.trim().toLowerCase();
      return localidades.filter((l) => l.toLowerCase().includes(q)).slice(0, 6);
    },
    [localidades]
  );

  const handleOrigenChange = (texto: string) => {
    setOrigen(texto);
    setErrores((prev) => ({ ...prev, origen: "" }));
    setSugerenciasOrigen(filtrarCiudades(texto));
  };

  const handleDestinoChange = (texto: string) => {
    setDestino(texto);
    setErrores((prev) => ({ ...prev, destino: "" }));
    setSugerenciasDestino(filtrarCiudades(texto));
  };

  const swapLocations = () => {
    setOrigen(destino);
    setDestino(origen);
    setSugerenciasOrigen([]);
    setSugerenciasDestino([]);
  };

  const seleccionarOrigen = (ciudad: string) => {
    setOrigen(ciudad);
    setSugerenciasOrigen([]);
  };

  const seleccionarDestino = (ciudad: string) => {
    setDestino(ciudad);
    setSugerenciasDestino([]);
  };

  const aplicarFechaRapida = (diasDesdeHoy: number) => {
    const base = new Date();
    base.setDate(base.getDate() + diasDesdeHoy);
    setFecha(formatISODate(base));
  };

  const handleDateChange = (_: any, selected?: Date) => {
    setShowDatePicker(false);
    if (selected) {
      setFecha(formatISODate(selected));
    }
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    const nuevosErrores: Record<string, string> = {};
    if (!origen.trim()) nuevosErrores.origen = "Ingresá una ciudad de origen";
    if (!destino.trim()) nuevosErrores.destino = "Ingresá una ciudad de destino";

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    setSugerenciasOrigen([]);
    setSugerenciasDestino([]);
    onSearch({ origen: origen.trim(), destino: destino.trim(), fecha });
  };

  const renderSugerencias = (
    items: string[],
    onSelect: (ciudad: string) => void,
    idPrefix: string
  ) => {
    if (items.length === 0) return null;
    return (
      <View
        style={[
          styles.suggestionBox,
          { backgroundColor: surface, borderColor: border },
        ]}
      >
        <FlatList
          data={items}
          keyExtractor={(item, index) => `${idPrefix}-${index}`}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item)}
              style={({ pressed }) => [
                styles.suggestion,
                {
                  borderBottomColor: border,
                  backgroundColor: pressed ? surfaceElevated : surface,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Seleccionar ${item}`}
            >
              <Ionicons
                name="location-outline"
                size={16}
                color={textSecondary}
                style={styles.suggestionIcon}
              />
              <Text allowFontScaling style={[styles.suggestionText, { color: text }]}>
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>
    );
  };

  const shortcutToday = hoy();
  const shortcutTomorrow = formatISODate(
    new Date(new Date().setDate(new Date().getDate() + 1))
  );
  const shortcutDayAfter = formatISODate(
    new Date(new Date().setDate(new Date().getDate() + 2))
  );

  const displayDate = (() => {
    const [y, m, d] = fecha.split("-").map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  })();

  return (
    <View style={styles.container} accessibilityLabel="Buscar viajes">
      <View style={styles.fieldGroup}>
        <View style={styles.inputWithSuggestions}>
          <InputField
            label="Origen"
            placeholder="Ej: San Roque, Corrientes..."
            value={origen}
            onChangeText={handleOrigenChange}
            icon="location-outline"
            error={errores.origen}
            clearable
            onClear={() => {
              setOrigen("");
              setSugerenciasOrigen([]);
            }}
            autoComplete="off"
            autoCorrect={false}
          />
          {renderSugerencias(sugerenciasOrigen, seleccionarOrigen, "origen")}
        </View>

        <View style={styles.swapContainer}>
          <Pressable
            onPress={swapLocations}
            style={({ pressed }) => [
              styles.swapButton,
              {
                backgroundColor: surface,
                borderColor: border,
                opacity: pressed ? 0.7 : 1,
                transform: [{ rotate: "90deg" }],
              },
            ]}
            accessibilityLabel="Intercambiar origen y destino"
            accessibilityHint="Intercambia las ciudades de origen y destino"
            accessibilityRole="button"
          >
            <Ionicons name="swap-horizontal" size={20} color={textSecondary} />
          </Pressable>
        </View>

        <View style={styles.inputWithSuggestions}>
          <InputField
            label="Destino"
            placeholder="Ej: Corrientes, Goya..."
            value={destino}
            onChangeText={handleDestinoChange}
            icon="location-outline"
            error={errores.destino}
            clearable
            onClear={() => {
              setDestino("");
              setSugerenciasDestino([]);
            }}
            autoComplete="off"
            autoCorrect={false}
          />
          {renderSugerencias(sugerenciasDestino, seleccionarDestino, "destino")}
        </View>

        <Pressable
          onPress={() => setShowDatePicker(true)}
          style={({ pressed }) => [
            styles.dateField,
            {
              backgroundColor: surface,
              borderColor: border,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          accessibilityLabel={`Fecha seleccionada: ${displayDate}`}
          accessibilityRole="button"
          accessibilityHint="Abrir selector de fecha"
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={textSecondary}
            style={styles.dateIcon}
          />
          <View>
            <Text
              allowFontScaling
              style={[styles.dateLabel, { color: textSecondary }]}
            >
              Fecha
            </Text>
            <Text allowFontScaling style={[styles.dateValue, { color: text }]}>
              {displayDate}
            </Text>
          </View>
        </Pressable>

        {showDatePicker && (
          <DateTimePicker
            value={(() => {
              const [y, m, d] = fecha.split("-").map(Number);
              return new Date(y, m - 1, d);
            })()}
            minimumDate={new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>

      <Button
        variant="primary"
        size="lg"
        loading={isLoading}
        onPress={handleSubmit}
        icon="search"
        iconPosition="left"
        accessibilityLabel="Buscar viajes disponibles"
      >
        Buscar viajes
      </Button>

      <View style={styles.shortcuts} accessibilityLabel="Atajos de fecha">
        <Text
          allowFontScaling
          style={[styles.shortcutsLabel, { color: textSecondary }]}
        >
          Viajar:
        </Text>
        <Button
          variant={fecha === shortcutToday ? "primary" : "secondary"}
          size="sm"
          pill
          onPress={() => aplicarFechaRapida(0)}
        >
          Hoy
        </Button>
        <Button
          variant={fecha === shortcutTomorrow ? "primary" : "secondary"}
          size="sm"
          pill
          onPress={() => aplicarFechaRapida(1)}
        >
          Mañana
        </Button>
        <Button
          variant={fecha === shortcutDayAfter ? "primary" : "secondary"}
          size="sm"
          pill
          onPress={() => aplicarFechaRapida(2)}
        >
          Pasado mañana
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  fieldGroup: {
    gap: 4,
    marginBottom: 8,
  },
  inputWithSuggestions: {
    position: "relative",
    zIndex: 1,
  },
  swapContainer: {
    alignItems: "center",
    marginVertical: 4,
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 56,
    marginBottom: 8,
  },
  dateIcon: {
    marginRight: 10,
  },
  dateLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  suggestionBox: {
    position: "absolute",
    top: 76,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 12,
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    maxHeight: 220,
  },
  suggestion: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
  },
  suggestionIcon: {
    marginRight: 10,
  },
  suggestionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  shortcuts: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    flexWrap: "wrap",
  },
  shortcutsLabel: {
    fontSize: 13,
    fontWeight: "700",
    marginRight: 4,
  },
});
