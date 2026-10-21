import { useRouter, usePathname } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();
  const { userInfo } = useAuth();

  const perfil = userInfo?.perfil;
  const isCliente = perfil === 'usuarioCliente';
  const isChofer = perfil === 'usuarioChofer';

  // Mapeo de rutas actuales a rutas de destino personalizadas
  const rutasPersonalizadas: Record<string, string> = {
    // Cliente
    '/pantallas/actualizarContrasenia': '/perfil',
    '/pantallas/detalleReserva': '/reserva',
    '/pantallas/detalleViaje': '/viajes',
    '/pantallas/detalleVenta': '/reserva',
    '/pantallas/pagoExitoso': '/reserva',
    '/pantallas/pagoFallido': '/reserva',
    '/pantallas/realizarReserva': '/pantallas/seleccionarAsientos',
    '/pantallas/seleccionarAsientos': '/pantallas/detalleViaje',

    // Chofer / administración
    '/pantallas/choferListaPasajeros': '/choferViajes',
    '/pantallas/crearTransporte': '/listarTransportes',
    '/pantallas/crearViaje': '/listarViajes',
    '/pantallas/editarTransporte': '/listarTransportes',
    '/pantallas/editarViaje': '/listarViajes',
    '/pantallas/listarReservasPorViaje': '/listarViajes',
    '/pantallas/modificarEmpresa': '/perfil',
    '/pantallas/modificarUsuario': '/perfil',
    '/pantallas/ventaReserva': '/choferReserva',
    '/empresaUsuarios': '/listarTransportes',
  };

  // La ruta /pantallas/confirmarReserva es compartida: chofer vuelve a choferReserva,
  // cliente vuelve a reserva.
  if (pathname === '/pantallas/confirmarReserva') {
    rutasPersonalizadas['/pantallas/confirmarReserva'] = isChofer ? '/choferReserva' : '/reserva';
  }

  const handleBack = () => {
    if (rutasPersonalizadas[pathname]) {
      router.replace(rutasPersonalizadas[pathname] as any);
    } else {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handleBack}
      style={{ padding: 2 }}
      accessibilityLabel="Volver atrás"
      accessibilityRole="button"
      hitSlop={8}
    >
      <Ionicons name="arrow-back" size={24} color="white" />
    </Pressable>
  );
}
