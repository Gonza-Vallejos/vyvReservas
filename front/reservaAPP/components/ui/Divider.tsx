import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { useThemeColor } from "../Themed";
import { Spacing } from "@/constants/Spacing";

export interface DividerProps {
  label?: string;
  style?: ViewStyle;
}

export default function Divider({ label, style }: DividerProps) {
  const border = useThemeColor({}, "border");
  const textMuted = useThemeColor({}, "textMuted");

  if (label) {
    return (
      <View style={[styles.container, style]}>
        <View style={[styles.line, { backgroundColor: border }]} />
        <Text style={[styles.label, { color: textMuted }]}>{label}</Text>
        <View style={[styles.line, { backgroundColor: border }]} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.simpleLine,
        { backgroundColor: border },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.base,
  },
  line: {
    flex: 1,
    height: 1,
  },
  label: {
    marginHorizontal: Spacing.md,
    fontSize: 12,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  simpleLine: {
    height: 1,
    width: "100%",
    marginVertical: Spacing.sm,
  },
});
