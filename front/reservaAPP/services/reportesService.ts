import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../environment/config";

export const obtenerPasajerosPorViaje = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/reportes/obtenerPasajerosPorViaje/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener pasajeros por viaje",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerViajesMasReservadosPorEmpresa = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/reportes/obtenerViajesMasReservadosPorEmpresa/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener viajes mas reservados por empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerViajesPorTransporteDeEmpresa = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/reportes/obtenerViajesPorTransporteDeEmpresa/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener viajes por transporte de empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerPasajerosPorEmpresa = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/reportes/obtenerPasajerosPorEmpresa/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener pasajeros por empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerClientesConMasReservasPorEmpresa = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/reportes/obtenerClientesConMasReservasPorEmpresa/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener pasajeros con mas reservas por empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerClientesConVentasConfirmadasPorEmpresa = async (
  id: number
) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/reportes/obtenerClientesConVentasConfirmadasPorEmpresa/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener pasajeros con ventas confirmada por empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerGananciaTotalPorEmpresa = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/reportes/obtenerGananciaTotalPorEmpresa/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener ganancia total por empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerGananciasPorViajePorEmpresa = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/reportes/obtenerGananciasPorViajePorEmpresa/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener ganancia total por viaje por empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerUsuariosConReservasSinVenta = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/reportes/obtenerUsuariosConReservasSinVenta/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener pasajeros con ventas NO confirmada por empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};
