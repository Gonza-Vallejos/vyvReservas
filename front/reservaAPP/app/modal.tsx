import React from "react";
import { View, Text, Pressable } from "react-native";
import { useAuth } from "../context/AuthContext";

const modal = () => {
  const { logout } = useAuth();

  return (
    <View
      style={{
        padding: 16,
        backgroundColor: "#eee",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ fontSize: 20 }}>Mi App</Text>
      <Pressable onPress={logout}>
        <Text style={{ color: "blue" }}>Cerrar sesión</Text>
      </Pressable>
    </View>
  );
};

export default modal;
