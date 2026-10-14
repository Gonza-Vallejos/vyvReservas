import { apiClient } from "./apiClient";

export const obtenerTransportePorEmpresa = async (id: number) => {
  const response = await apiClient.get(
    `/medioTransporte/obtenerTransportePorEmpresa/${id}`
  );
  return response.data;
};

export const eliminarTransporte = async (id: number) => {
  const response = await apiClient.put(
    `/medioTransporte/eliminarTransporte/${id}`,
    {}
  );
  return response.data;
};

export const crearTransporte = async (transporteData: any) => {
  try {
    const response = await apiClient.post(
      "/medioTransporte/crearTransporte",
      transporteData
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const editarTransporte = async (id: number, transporteData: any) => {
  try {
    const response = await apiClient.put(
      `/medioTransporte/actualizarTransporte/${id}`,
      transporteData
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
  const response = await apiClient.get(
    `/medioTransporte/obtenerTransporteId/${id}`
  );
  return response.data;
};

export const obtenerViajesPorTransporte = async (id: number) => {
  try {
    const response = await apiClient.get(
      `/medioTransporte/obtenerViajesPorTransporte/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const verificarTransporteSinReservas = async (id: any) => {
  try {
    const response = await apiClient.get(
      `/medioTransporte/verificarTransporteSinReservas/${id}`
    );
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
