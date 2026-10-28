import React, { useEffect, useRef } from "react";
import { Animated, ViewStyle, Platform } from "react-native";

export interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: "up" | "down" | "none";
  distance?: number;
  style?: ViewStyle | ViewStyle[];
}

/**
 * FadeInView: Envoltorio para transiciones de entrada suaves y modernas.
 * Agrega opacidad progresiva y un sutil desplazamiento (default: hacia arriba 8px).
 * Ejecuta en el hilo nativo (useNativeDriver: true).
 */
export default function FadeInView({
  children,
  delay = 0,
  duration = 280,
  direction = "up",
  distance = 10,
  style,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const initialTranslate =
    direction === "up" ? distance : direction === "down" ? -distance : 0;
  const translateY = useRef(new Animated.Value(initialTranslate)).current;

  useEffect(() => {
    const animation = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]);

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity, translateY, delay, duration]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity,
          transform: direction !== "none" ? [{ translateY }] : undefined,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
