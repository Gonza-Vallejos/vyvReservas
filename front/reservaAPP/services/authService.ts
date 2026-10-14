import { apiClient } from "./apiClient";

export const loginUsuario = async (usuario: string, contrasenia: string) => {
  const response = await apiClient.post("/api/auth/login", {
    usuario,
    contrasenia,
  });
  return response.data;
};

export const registrarUsuario = async (usuarioData: any) => {
  try {
    const response = await apiClient.post("/api/usuarios", usuarioData);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al crear el usuario",
      error.response?.data || error.message
    );
    throw error.response?.data || { mensaje: "Error desconocido al registrar" };
  }
};

export const enviarEmailRecuperacion = async (
  email: string,
  plataforma: string
) => {
  try {
    const response = await apiClient.post("/api/auth/recuperar", {
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
    const response = await apiClient.post(`/api/auth/resetear/${token}`, {
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
