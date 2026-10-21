import React from 'react';
import { Platform, useColorScheme } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

export default function TabLayout() {
  const { isLoggedIn, isLoading, userInfo } = useAuth();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  if (isLoading) return null;
  if (!isLoggedIn) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarShowLabel: true,
        headerShown: false,
        tabBarHideOnKeyboard: false,
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "relative",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: Platform.OS === "ios" ? 84 : 64,
          paddingBottom: Platform.OS === "ios" ? 24 : 6,
          paddingTop: 6,
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home-outline";

          switch (route.name) {
            case "index":
              iconName = "home-outline";
              break;
            case "reserva":
              iconName = "calendar-outline";
              break;
            case "viajes":
              iconName = "navigate-outline";
              break;
            case "perfil":
              iconName = "person-circle-outline";
              break;
            case "usuarios":
            case "empresaUsuarios":
              iconName = "people-outline";
              break;
            case "choferViajes":
            case "listarViajes":
              iconName = "trail-sign-outline";
              break;
            case "choferReserva":
              iconName = "reader-outline";
              break;
            case "listarReservas":
              iconName = "clipboard-outline";
              break;
            case "listarTransportes":
              iconName = "bus-outline";
              break;
            case "crearEmpresa":
              iconName = "business-outline";
              break;
            case "listarEmpresas":
              iconName = "clipboard-outline";
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Inicio" }} />

      <Tabs.Screen
        name="viajes"
        options={{
          title: "Viajes",
          href: userInfo?.perfil === "usuarioCliente" ? undefined : null,
          lazy: true,
        }}
      />

      <Tabs.Screen
        name="reserva"
        options={{
          title: "Mis Reservas",
          href: userInfo?.perfil === "usuarioCliente" ? undefined : null,
          lazy: true,
        }}
      />

      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          href: userInfo?.perfil === "usuarioCliente" ? undefined : null,
          lazy: true,
        }}
      />

      <Tabs.Screen
        name="crearEmpresa"
        options={{
          title: "Nueva Empresa",
          href: userInfo?.perfil === "usuarioAdministrador" ? undefined : null,
          lazy: true,
        }}
      />

      <Tabs.Screen
        name="listarEmpresas"
        options={{
          title: "Ver Empresas",
          href: userInfo?.perfil === "usuarioAdministrador" ? undefined : null,
          lazy: true,
        }}
      />

      <Tabs.Screen
        name="usuarios"
        options={{
          title: "Usuarios",
          href: userInfo?.perfil === "usuarioAdministrador" ? undefined : null,
          lazy: true,
        }}
      />

      <Tabs.Screen
        name="choferViajes"
        options={{
          title: "Viajes",
          href: userInfo?.perfil === "usuarioChofer" ? undefined : null,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="choferReserva"
        options={{
          title: "Reservas",
          href: userInfo?.perfil === "usuarioChofer" ? undefined : null,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="listarReservas"
        options={{
          title: "Reservas",
          href:
            userInfo?.perfil === "usuarioEmpresa" ||
            userInfo?.perfil === "usuarioMostrador"
              ? undefined
              : null,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="listarViajes"
        options={{
          title: "Viajes",
          href:
            userInfo?.perfil === "usuarioEmpresa" ||
            userInfo?.perfil === "usuarioMostrador"
              ? undefined
              : null,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="listarTransportes"
        options={{
          title: "Transportes",
          href:
            userInfo?.perfil === "usuarioEmpresa" ||
            userInfo?.perfil === "usuarioMostrador"
              ? undefined
              : null,
          lazy: true,
        }}
      />
      <Tabs.Screen
        name="empresaUsuarios"
        options={{
          title: "Usuarios",
          href: userInfo?.perfil === "usuarioEmpresa" ? undefined : null,
          lazy: true,
        }}
      />
    </Tabs>
  );
}
