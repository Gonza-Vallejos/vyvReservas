import { Slot, Stack } from "expo-router";
import { AuthProvider } from "../../context/AuthContext";

export default function PantallaLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          gestureEnabled: true,
          gestureDirection: "horizontal",
          headerShown: false,
        }}
      />
    </AuthProvider>
  );
}
