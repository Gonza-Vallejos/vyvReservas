import { useRouter, usePathname } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Mapeo de rutas actuales a rutas de destino personalizadas
  const rutasPersonalizadas: Record<string, string> = {

    //rutas personalizadas para hacer el back

    //cliente
    '/pantallas/actualizarContrasenia': '/perfil',
    '/pantallas/choferListaPasajeros': '/choferViajes',
    '/pantallas/confirmarReserva': '/choferReserva',
    '/pantallas/crearTransporte': '/listarTransportes',
    '/pantallas/crearViaje': '/listarViajes',
    '/pantallas/detalleReserva': '/reserva',
    '/pantallas/detalleVenta': '/reserva',
    '/pantallas/editarTransporte': '/listarTransportes',
    '/pantallas/editarViaje': '/listarViajes',
    '/pantallas/listarReservasPorViaje': '/listarViajes',
    '/pantallas/modificarEmpresa': '/perfil',
    '/pantallas/modificarUsuario': '/perfil',
    '/pantallas/realizarReserva': '/viajes',
    '/empresaUsuarios' : '/listarTransportes',
    
    // más rutas si necesitás
  };

  const handleBack = () => {
    if (rutasPersonalizadas[pathname]) {
     router.replace(rutasPersonalizadas[pathname] as any);
 // redirige sin dejar la ruta anterior en el stack
    } else {
      router.back(); // comportamiento por defecto
    }
  };

  return (
    <Pressable onPress={handleBack} style={{ padding: 2 }}>
      <Ionicons name="arrow-back" size={24} color="white" />
    </Pressable>
  );
}