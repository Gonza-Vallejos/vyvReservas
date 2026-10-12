import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../environment/config";

export const crearReserva = async (reservaData: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/reserva/crearReserva`,
      reservaData,
      {
        headers: {
          Authorization: `Bearer ${token}`, // Agregar token al encabezado
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error al crear la reserva",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerReservas = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(
      `${API_URL}/reserva/obtenerReservasPorUsuario`,
      {
        params: {
          id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      console.error(
        "Error al obtener las reservas",
        error.response?.data || error.message
      );
    } else {
      console.error("Error desconocido", error);
    }
    throw error;
  }
};

export const actualizarReserva = async (id: number, pasajeroData: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/reserva/actualizarReserva/${id}`,
      pasajeroData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al actualizar la reserva",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerPasajeroPorId = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/reserva/listarPasajeroPorId/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const listarPasajeroPorViaje = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/reserva/listarPasajeroPorViaje/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const obtenerReservasPorEmpresa = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/reserva/obtenerReservasPorEmpresa/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const listarReservasPorViaje = async (id: number) => {
  const token = await AsyncStorage.getItem("token");

  const response = await axios.get(
    `${API_URL}/reserva/listarReservasPorViaje/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const eliminarReserva = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/reserva/eliminarReserva/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al eliminar la reserva",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const listarReservasYPasajerosPorViaje = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/reserva/listarReservasYPasajerosPorViaje/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al listar las reserva y pasajeros segun viaje",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const eliminarPasajero = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/reserva/eliminarPasajero/${id}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al eliminar pasajero",
      error.response?.data || error.message
    );
    throw error;
  }
};
