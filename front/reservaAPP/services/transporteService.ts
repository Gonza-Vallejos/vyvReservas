import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../environment/config";

export const obtenerTransportePorEmpresa = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/medioTransporte/obtenerTransportePorEmpresa/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const eliminarTransporte = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const data = {};
  const response = await axios.put(
    `${API_URL}/medioTransporte/eliminarTransporte/${id}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const crearTransporte = async (transporteData: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/medioTransporte/crearTransporte`,
      transporteData,
      {
        headers: {
          Authorization: ` Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const editarTransporte = async (id: number, transporteData: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/medioTransporte/actualizarTransporte/${id}`,
      transporteData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error(
      "Error al actualizar el transporte",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerTransporteId = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/medioTransporte/obtenerTransporteId/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const obtenerViajesPorTransporte = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/medioTransporte/obtenerViajesPorTransporte/${id}`,
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

export const verificarTransporteSinReservas = async (id: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/medioTransporte/verificarTransporteSinReservas/${id}`,
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
