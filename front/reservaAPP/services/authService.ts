import axios from "axios";
import { API_URL } from "../environment/config";

export const loginUsuario = async (usuario: string, contrasenia: string) => {
  const response = await axios.post(`${API_URL}/api/auth/login`, {
    usuario,
    contrasenia,
  });
  return response.data;
};

export const registrarUsuario = async (usuarioData: any) => {
  try {
    const response = await axios.post(
      `${API_URL}/usuarios/crearUsuario/`,
      usuarioData
    );
    return response.data;
  } catch (error: any) {
    // Mostrás el error por consola
    console.error(
      "Error al crear el usuario",
      error.response?.data || error.message
    );

    // Lanzas solo la respuesta del backend para que el frontend la maneje mejor
    throw error.response?.data || { mensaje: "Error desconocido al registrar" };
  }
};

export const enviarEmailRecuperacion = async (
  email: string,
  plataforma: string
) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/recuperar`, {
      email,
      plataforma,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al solicitar recuperación de contraseña:",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const resetearContrasenia = async (
  token: string,
  nuevaContrasenia: string
) => {
  try {
    const response = await axios.post(`${API_URL}/api/auth/resetear/${token}`, {
      nuevaContrasenia,
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al restablecer contraseña:",
      error.response?.data || error.message
    );
    throw error;
  }
};
