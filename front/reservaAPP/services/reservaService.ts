import { apiClient } from "./apiClient";

export const crearReserva = async (reservaData: any) => {
  try {
    const response = await apiClient.post("/reserva/crearReserva", reservaData);
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
    const response = await apiClient.get("/reserva/obtenerReservasPorUsuario", {
      params: { id },
    });
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al obtener las reservas",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const actualizarReserva = async (id: number, pasajeroData: any) => {
  try {
    const response = await apiClient.put(
      `/reserva/actualizarReserva/${id}`,
      pasajeroData
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
  const response = await apiClient.get(`/reserva/listarPasajeroPorId/${id}`);
  return response.data;
};

export const listarPasajeroPorViaje = async (id: number) => {
  const response = await apiClient.get(`/reserva/listarPasajeroPorViaje/${id}`);
  return response.data;
};

export const obtenerReservasPorEmpresa = async (id: number) => {
  const response = await apiClient.get(
    `/reserva/obtenerReservasPorEmpresa/${id}`
  );
  return response.data;
};

export const listarReservasPorViaje = async (id: number) => {
  const response = await apiClient.get(
    `/reserva/listarReservasPorViaje/${id}`
  );
  return response.data;
};

export const eliminarReserva = async (id: number) => {
  try {
    const response = await apiClient.put(`/reserva/eliminarReserva/${id}`, {});
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
    const response = await apiClient.get(
      `/reserva/listarReservasYPasajerosPorViaje/${id}`
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
    const response = await apiClient.put(`/reserva/eliminarPasajero/${id}`, {});
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al eliminar pasajero",
      error.response?.data || error.message
    );
    throw error;
  }
};
