import { apiClient } from "./apiClient";

export const obtenerEmpresaPorId = async (id: number) => {
  const response = await apiClient.get(`/empresa/obtenerEmpresaId/${id}`);
  return response.data;
};

export const crearEmpresa = async (empresaData: any) => {
  try {
    const response = await apiClient.post("/empresa/crearEmpresa/", empresaData);
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
    const response = await apiClient.put(
      `/empresa/actualizarEmpresa/${id}`,
      empresaData
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
    const response = await apiClient.get("/empresa/obtenerEmpresa");
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
    const response = await apiClient.post(
      `/usuarioEmpresa/asociar/${id}/${empresaId}`,
      {}
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
    const response = await apiClient.get(`/usuarioEmpresa/empresaUsuario/${id}`);
    return response.data.empresa_id;
  } catch (error: any) {
    console.error(
      "Error al al obtener  la empresa asociada",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const desasociarUsuarioEmpresa = async (id: number) => {
  try {
    const response = await apiClient.delete(
      `/usuarioEmpresa/desasociar/${id}`
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
    const response = await apiClient.put(`/empresa/eliminarEmpresa/${id}`, {});
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al eliminar empresa:",
      error.response?.data || error.message
    );
    throw error;
  }
};
