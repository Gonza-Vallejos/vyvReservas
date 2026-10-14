import React from "react";
import {
  View,
  Pressable,
  StyleSheet,
  ViewStyle,
  PressableProps,
} from "react-native";
import { useThemeColor } from "../Themed";

interface CardBaseProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

type CardProps =
  | (CardBaseProps & { onPress?: undefined; pressableProps?: never })
  | (CardBaseProps & {
      onPress: () => void;
      pressableProps?: Omit<PressableProps, "onPress" | "style">;
    });

export default function Card({
  children,
  style,
  padded = true,
  onPress,
  pressableProps,
}: CardProps) {
  const surface = useThemeColor({}, "surface");
  const border = useThemeColor({}, "border");

  const content = (
    <View
      style={[
        styles.card,
        {
          backgroundColor: surface,
          borderColor: border,
          padding: padded ? 16 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        {...pressableProps}
        onPress={onPress}
        accessibilityRole="button"
        style={({ pressed }) => [
          { opacity: pressed ? 0.97 : 1, transform: [{ scale: pressed ? 0.995 : 1 }] },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
});
