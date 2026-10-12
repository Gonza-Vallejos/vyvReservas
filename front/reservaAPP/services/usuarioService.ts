import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../environment/config";

export const obtenerUsuarioPorId = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/usuarios/obtenerUsuarioId/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const actualizarUsuario = async (id: number, usuarioData: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/usuarios/actualizarUsuario/${id}`,
      usuarioData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al actualizar el usuario",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerUsuarios = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(`${API_URL}/usuarios/obtenerUsuario`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener usuarios",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const actualizarPerfil = async (id: number, perfil_id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/usuarios/actualizarPerfil/${id}`,
      { perfil_id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al actualizar el perfil",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        mensaje: "Error desconocido al actualizar el perfil",
      }
    );
  }
};

export const actualizarContraseña = async (id: number, data: any) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/usuarios/actualizarContrasenia/${id}`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al actualizar la contraseña",
      error.response?.data || error.message
    );
    throw (
      error.response?.data || {
        mensaje: "Error desconocido al actualizar la contraseña",
      }
    );
  }
};

export const obtenerUsuariosPorEmpresa = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/usuarioEmpresa/obtenerUsuariosPorEmpresa/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener usuarios por empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

//eliminar usuario
export const eliminarUsuario = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/usuarios/eliminarUsuario/${id}`,
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
      "Error al eliminar usuario:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerUsuariosChoferPorEmpresa = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/usuarios/obtenerUsuarioChoferPorEmpresa/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener los Choferes de la empresa",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerUsuarioEmpresaPorId = async (id: number) => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) throw new Error("No se encontró el token");

    const response = await axios.get(`${API_URL}/usuarioEmpresa/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error("Error al obtener usuarioEmpresa:", error);
    throw error;
  }
};
