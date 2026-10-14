import { apiClient } from "./apiClient";

export const obtenerUsuarioPorId = async (id: number) => {
  const response = await apiClient.get(`/usuarios/obtenerUsuarioId/${id}`);
  return response.data;
};

export const actualizarUsuario = async (id: number, usuarioData: any) => {
  try {
    const response = await apiClient.put(
      `/usuarios/actualizarUsuario/${id}`,
      usuarioData
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
    const response = await apiClient.get("/usuarios/obtenerUsuario");
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
    const response = await apiClient.put(`/usuarios/actualizarPerfil/${id}`, {
      perfil_id,
    });
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
    const response = await apiClient.put(
      `/usuarios/actualizarContrasenia/${id}`,
      data
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
    const response = await apiClient.get(
      `/usuarioEmpresa/obtenerUsuariosPorEmpresa/${id}`
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

export const eliminarUsuario = async (id: number) => {
  try {
    const response = await apiClient.put(`/usuarios/eliminarUsuario/${id}`, {});
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
    const response = await apiClient.get(
      `/usuarios/obtenerUsuarioChoferPorEmpresa/${id}`
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
    const response = await apiClient.get(`/usuarioEmpresa/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error al obtener usuarioEmpresa:", error);
    throw error;
  }
};
