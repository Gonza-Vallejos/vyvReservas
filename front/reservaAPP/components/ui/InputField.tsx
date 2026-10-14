import React, { useState, forwardRef } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useThemeColor } from "../Themed";

interface InputFieldProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  helper?: string;
  containerStyle?: ViewStyle;
  clearable?: boolean;
  onClear?: () => void;
  allowFontScaling?: boolean;
  required?: boolean;
}

const InputField = forwardRef<TextInput, InputFieldProps>(
  (
    {
      label,
      icon,
      error,
      helper,
      containerStyle,
      clearable,
      onClear,
      allowFontScaling = true,
      required,
      ...textInputProps
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const text = useThemeColor({}, "text");
    const textSecondary = useThemeColor({}, "textSecondary");
    const textMuted = useThemeColor({}, "textMuted");
    const surface = useThemeColor({}, "surface");
    const border = useThemeColor({}, "border");
    const errorColor = useThemeColor({}, "error");
    const primary = useThemeColor({}, "primary");

    const hasError = Boolean(error);
    const activeBorder = hasError ? errorColor : isFocused ? primary : border;

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text
            allowFontScaling={allowFontScaling}
            style={[styles.label, { color: textSecondary }]}
          >
            {label}
            {required && (
              <Text style={{ color: errorColor }}> *</Text>
            )}
          </Text>
        )}
        <View
          style={[
            styles.wrapper,
            {
              backgroundColor: surface,
              borderColor: activeBorder,
            },
          ]}
        >
          {icon && (
            <Ionicons
              name={icon}
              size={20}
              color={isFocused ? primary : textMuted}
              style={styles.icon}
            />
          )}
          <TextInput
            ref={ref}
            {...textInputProps}
            allowFontScaling={allowFontScaling}
            placeholderTextColor={textMuted}
            style={[
              styles.input,
              { color: text },
              textInputProps.style,
            ]}
            onFocus={(e) => {
              setIsFocused(true);
              textInputProps.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              textInputProps.onBlur?.(e);
            }}
            accessibilityLabel={label || textInputProps.accessibilityLabel}
            accessibilityHint={
              error
                ? `${helper || ""} Error: ${error}`
                : helper || textInputProps.accessibilityHint
            }
            aria-invalid={hasError}
          />
          {clearable && Boolean(textInputProps.value) && (
            <Pressable
              onPress={onClear}
              hitSlop={8}
              accessibilityLabel="Limpiar campo"
              accessibilityRole="button"
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color={textMuted} />
            </Pressable>
          )}
        </View>
        {helper && !hasError && (
          <Text
            allowFontScaling={allowFontScaling}
            style={[styles.helper, { color: textMuted }]}
          >
            {helper}
          </Text>
        )}
        {hasError && (
          <Text
            allowFontScaling={allowFontScaling}
            style={[styles.error, { color: errorColor }]}
            accessibilityLiveRegion="polite"
          >
            {error}
          </Text>
        )}
      </View>
    );
  }
);

InputField.displayName = "InputField";

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 48,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 12,
    minHeight: 44,
  },
  clearButton: {
    padding: 4,
    marginLeft: 6,
  },
  helper: {
    fontSize: 12,
    marginTop: 4,
  },
  error: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
});

export default InputField;
