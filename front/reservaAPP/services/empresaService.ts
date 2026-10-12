import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../environment/config";

export const obtenerEmpresaPorId = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/empresa/obtenerEmpresaId/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const crearEmpresa = async (empresaData: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/empresa/crearEmpresa/`,
      empresaData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al crear la empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const actualizarEmpresa = async (id: number, empresaData: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/empresa/actualizarEmpresa/${id}`,
      empresaData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al actualizar la empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerEmpresas = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(`${API_URL}/empresa/obtenerEmpresa`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener las empresas",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const asociarUsuarioEmpresa = async (id: number, empresaId: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/usuarioEmpresa/asociar/${id}/${empresaId}`,
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
      "Error al asociar a la empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerUsuarioEmpresaAsociado = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/usuarioEmpresa/empresaUsuario/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data.empresa_id;
  } catch (error: any) {
    console.error(
      "Error al al obtener  la empresa asociada",
      error.response?.data || error.message
    );
    throw error;
  } // Retorna el ID directamente
};

export const desasociarUsuarioEmpresa = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.delete(
      `${API_URL}/usuarioEmpresa/desasociar/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al desasociar a la empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const eliminarEmpresa = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/empresa/eliminarEmpresa/${id}`,
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
      "Error al eliminar empresa:",
      error.response?.data || error.message
    );
    throw error;
  }
};
