import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../Themed";

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

interface DateSelectorBarProps {
  selectedDate: string;
  onSelectDate: (isoDate: string) => void;
}

const formatISO = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function DateSelectorBar({
  selectedDate,
  onSelectDate,
}: DateSelectorBarProps) {
  const primary = useThemeColor({}, "primary");
  const surface = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");
  const text = useThemeColor({}, "text");
  const textSecondary = useThemeColor({}, "textSecondary");

  const parseBaseDate = (dStr: string) => {
    if (!dStr) return new Date();
    const parts = dStr.split("-");
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dStr);
  };

  const current = parseBaseDate(selectedDate);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const days = [];
  for (let offset = -2; offset <= 2; offset++) {
    const d = new Date(current);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);

    const isPast = d.getTime() < hoy.getTime();
    const isToday = d.getTime() === hoy.getTime();
    const isoString = formatISO(d);
    const isSelected = selectedDate === isoString;

    days.push({
      dateObj: d,
      iso: isoString,
      dayName: DIAS_SEMANA[d.getDay()],
      dayNumber: d.getDate(),
      monthNumber: d.getMonth() + 1,
      isPast,
      isToday,
      isSelected,
    });
  }

  const shiftDays = (delta: number) => {
    const nextDate = new Date(current);
    nextDate.setDate(nextDate.getDate() + delta);
    nextDate.setHours(0, 0, 0, 0);
    if (nextDate.getTime() < hoy.getTime()) return;
    onSelectDate(formatISO(nextDate));
  };

  return (
    <View
      style={styles.container}
      accessibilityRole="tablist"
      accessibilityLabel="Selector de fecha de viaje"
    >
      <Pressable
        onPress={() => shiftDays(-1)}
        style={({ pressed }) => [
          styles.navButton,
          { backgroundColor: surface, borderColor: border, opacity: pressed ? 0.7 : 1 },
        ]}
        accessibilityLabel="Día anterior"
        accessibilityRole="button"
        hitSlop={8}
      >
        <Ionicons name="chevron-back" size={20} color={textSecondary} />
      </Pressable>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daysContainer}
      >
        {days.map((item) => {
          const label = item.isPast
            ? "No disponible"
            : item.isToday
            ? "Hoy"
            : `${item.dayNumber}/${item.monthNumber}`;

          return (
            <Pressable
              key={item.iso}
              onPress={() => !item.isPast && onSelectDate(item.iso)}
              disabled={item.isPast}
              accessibilityRole="tab"
              accessibilityState={{ selected: item.isSelected }}
              accessibilityLabel={
                item.isPast
                  ? `${item.dayName} ${item.dayNumber}, no disponible`
                  : `${item.dayName} ${item.dayNumber}, ${label}`
              }
              style={({ pressed }) => [
                styles.day,
                {
                  backgroundColor: item.isSelected ? primary : surface,
                  borderColor: item.isSelected ? primary : border,
                  opacity: item.isPast ? 0.5 : pressed ? 0.85 : 1,
                },
              ]}
            >
              <Text
                allowFontScaling
                style={[
                  styles.dayName,
                  { color: item.isSelected ? "#FFFFFF" : text },
                ]}
              >
                {item.dayName} {item.dayNumber}
              </Text>
              <Text
                allowFontScaling
                style={[
                  styles.daySub,
                  { color: item.isSelected ? "#FFFFFF" : textSecondary },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        onPress={() => shiftDays(1)}
        style={({ pressed }) => [
          styles.navButton,
          { backgroundColor: surface, borderColor: border, opacity: pressed ? 0.7 : 1 },
        ]}
        accessibilityLabel="Día siguiente"
        accessibilityRole="button"
        hitSlop={8}
      >
        <Ionicons name="chevron-forward" size={20} color={textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  daysContainer: {
    gap: 8,
    paddingHorizontal: 2,
  },
  day: {
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dayName: {
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
  },
  daySub: {
    fontSize: 11,
    fontWeight: "600",
    opacity: 0.9,
  },
});
