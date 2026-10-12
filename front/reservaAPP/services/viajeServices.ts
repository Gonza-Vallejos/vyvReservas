import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { API_URL } from "../environment/config";

export const listarViajes = async (origen: string, destino: string) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(`${API_URL}/viajes/viajesDisponible`, {
    params: {
      origen,
      destino,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const obtenerViajesId = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(`${API_URL}/viajes/obtenerViajesId/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const obtenerPasajerosPorViaje = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/reserva/listarPasajerosPorReserva/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const obtenerLocalidades = async () => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(`${API_URL}/ubicacion/obtenerLocalidad/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const obtenerProvincias = async () => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(`${API_URL}/ubicacion/obtenerProvincia/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const obtenerLocalidadesId = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/ubicacion/obtenerLocalidadesId/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const obtenerProvinciasId = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/ubicacion/obtenerProvinciasId/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const obtenerVentaDetalle = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/viajes/obtenerVentasViajesId/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const obtenerViajesPorChofer = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/viajes/obtenerViajesPorChofer/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const obtenerViajesPorEmpresa = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/viajes/obtenerViajesPorEmpresa/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const crearViaje = async (viajeData: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No se encontró token");

    const response = await axios.post(
      `${API_URL}/viajes/crearViaje`,
      viajeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error en crearViaje:", error);
    throw error;
  }
};

export const eliminarViaje = async (id: any) => {
  const token = await AsyncStorage.getItem("token");
  const data = {};
  const response = await axios.put(
    `${API_URL}/viajes/eliminarViaje/${id}`,
    data,
    {
      headers: {
        Authorization: ` Bearer ${token}`,
      },
    }
  );

  return response.data;
};

export const actualizarViaje = async (id: number, viajeData: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No se encontró token");

    const response = await axios.put(
      `${API_URL}/viajes/actualizarViaje/${id}`,
      viajeData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error en actualizarViaje:", error);
    throw error;
  }
};

export const existeReservaViaje = async (id: number): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/viajes/existeReservaViaje/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.existe === true;
  } catch (error) {
    console.error(
      "Error al verificar si existe la reserva para el viaje:",
      error
    );
    // Si hay un error, asumimos que no existe viaje
    return false;
  }
};
