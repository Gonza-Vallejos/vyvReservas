import React, { useState, forwardRef, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
  ViewStyle,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../Themed";
import { Radii, Spacing, Layout } from "@/constants/Spacing";

export interface InputFieldProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  clearable?: boolean;
  onClear?: () => void;
  isPassword?: boolean;
  allowFontScaling?: boolean;
  required?: boolean;
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      icon,
      rightIcon,
      onRightIconPress,
      error,
      helper,
      containerStyle,
      clearable,
      onClear,
      isPassword = false,
      allowFontScaling = true,
      required,
      secureTextEntry,
      ...textInputProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const text = useThemeColor({}, "text");
    const textSecondary = useThemeColor({}, "textSecondary");
    const textMuted = useThemeColor({}, "textMuted");
    const surface = useThemeColor({}, "surface");
    const border = useThemeColor({}, "border");
    const errorColor = useThemeColor({}, "error");
    const primary = useThemeColor({}, "primary");

    const iconScale = useRef(new Animated.Value(1)).current;
    const shakeX = useRef(new Animated.Value(0)).current;

    const hasError = Boolean(error);
    const activeBorder = hasError ? errorColor : isFocused ? primary : border;
    const isSecure = isPassword ? !showPassword : secureTextEntry;

    useEffect(() => {
      if (hasError) {
        Animated.sequence([
          Animated.timing(shakeX, { toValue: -4, duration: 40, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 4, duration: 60, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: -2, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 2, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 0, duration: 40, useNativeDriver: true }),
        ]).start();
      }
    }, [error]);

    const handleFocus = (e: any) => {
      setIsFocused(true);
      Animated.spring(iconScale, {
        toValue: 1.1,
        speed: 40,
        bounciness: 4,
        useNativeDriver: true,
      }).start();
      textInputProps.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      Animated.spring(iconScale, {
        toValue: 1,
        speed: 40,
        bounciness: 4,
        useNativeDriver: true,
      }).start();
      textInputProps.onBlur?.(e);
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text
            allowFontScaling={allowFontScaling}
            style={[styles.label, { color: hasError ? errorColor : textSecondary }]}
          >
            {label}
            {required && <Text style={{ color: errorColor }}> *</Text>}
          </Text>
        )}
        <Animated.View
          style={[
            styles.wrapper,
            {
              backgroundColor: surface,
              borderColor: activeBorder,
              borderWidth: isFocused || hasError ? 1.5 : 1,
              transform: [{ translateX: shakeX }],
            },
          ]}
        >
          {icon && (
            <Animated.View style={{ transform: [{ scale: iconScale }] }}>
              <Ionicons
                name={icon}
                size={20}
                color={hasError ? errorColor : isFocused ? primary : textMuted}
                style={styles.icon}
              />
            </Animated.View>
          )}
          <TextInput
            ref={ref}
            {...textInputProps}
            secureTextEntry={isSecure}
            allowFontScaling={allowFontScaling}
            placeholderTextColor={textMuted}
            style={[
              styles.input,
              { color: text },
              textInputProps.style,
            ]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            accessibilityLabel={label || textInputProps.accessibilityLabel}
            accessibilityHint={
              error
                ? `${helper || ""} Error: ${error}`
                : helper || textInputProps.accessibilityHint
            }
            aria-invalid={hasError}
          />

          {/* Botón de limpiar si clearable está activo */}
          {clearable && Boolean(textInputProps.value) && (
            <Pressable
              onPress={onClear}
              hitSlop={8}
              accessibilityLabel="Limpiar campo"
              accessibilityRole="button"
              style={styles.actionButton}
            >
              <Ionicons name="close-circle" size={18} color={textMuted} />
            </Pressable>
          )}

          {/* Toggle de visibilidad para contraseñas */}
          {isPassword && (
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              hitSlop={8}
              accessibilityLabel={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
              accessibilityRole="button"
              style={styles.actionButton}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={isFocused ? primary : textMuted}
              />
            </Pressable>
          )}

          {/* Icono derecho personalizado */}
          {rightIcon && !isPassword && (
            <Pressable
              onPress={onRightIconPress}
              disabled={!onRightIconPress}
              hitSlop={8}
              style={styles.actionButton}
            >
              <Ionicons name={rightIcon} size={20} color={textMuted} />
            </Pressable>
          )}
        </Animated.View>

        {helper && !hasError && (
          <Text
            allowFontScaling={allowFontScaling}
            style={[styles.helper, { color: textMuted }]}
          >
            {helper}
          </Text>
        )}

        {hasError && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color={errorColor} style={{ marginRight: 4 }} />
            <Text
              allowFontScaling={allowFontScaling}
              style={[styles.error, { color: errorColor }]}
              accessibilityLiveRegion="polite"
            >
              {error}
            </Text>
          </View>
        )}
      </View>
    );
  }
);

InputField.displayName = "InputField";

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    letterSpacing: 0.1,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    minHeight: Layout.inputHeight,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Platform.OS === "ios" ? 12 : 10,
    minHeight: Layout.inputHeight - 4,
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 32,
    minHeight: 32,
  },
  helper: {
    fontSize: 12,
    marginTop: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  error: {
    fontSize: 12,
    fontWeight: "600",
  },
});

export default InputField;
