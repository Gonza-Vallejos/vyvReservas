import { apiClient } from "./apiClient";

export const crearReserva = async (reservaData: any) => {
  try {
    const response = await apiClient.post("/api/reserva", reservaData);
    return response.data?.data ?? response.data;
  } catch (error: any) {
    try {
      const response = await apiClient.post("/reserva/crearReserva", reservaData);
      return response.data?.data ?? response.data;
    } catch {
      console.error(
        "Error al crear la reserva",
        error.response?.data || error.message
      );
      throw error;
    }
  }
};

export const obtenerReservas = async (id?: number): Promise<any> => {
  try {
    const params = id ? { id } : {};
    const response = await apiClient.get("/api/reserva/usuario", { params });
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? result : [];
  } catch (error: any) {
    try {
      const response = await apiClient.get("/reserva/obtenerReservasPorUsuario", {
        params: id ? { id } : {},
      });
      const result = response.data?.data ?? response.data;
      return Array.isArray(result) ? result : [];
    } catch {
      console.error(
        "Error al obtener las reservas",
        error.response?.data || error.message
      );
      throw error;
    }
  }
};

export const actualizarReserva = async (id: number, pasajeroData: any) => {
  try {
    const response = await apiClient.put(`/api/reserva/${id}`, pasajeroData);
    return response.data?.data ?? response.data;
  } catch (error: any) {
    try {
      const response = await apiClient.put(
        `/reserva/actualizarReserva/${id}`,
        pasajeroData
      );
      return response.data?.data ?? response.data;
    } catch {
      console.error(
        "Error al actualizar la reserva",
        error.response?.data || error.message
      );
      throw error;
    }
  }
};

export const obtenerPasajeroPorId = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/reserva/pasajero/${id}`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get(`/reserva/listarPasajeroPorId/${id}`);
    return response.data?.data ?? response.data;
  }
};

export const listarPasajeroPorViaje = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/reserva/viaje/${id}/pasajeros`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get(`/reserva/listarPasajeroPorViaje/${id}`);
    return response.data?.data ?? response.data;
  }
};

export const obtenerReservasPorEmpresa = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/reserva/empresa/${id}`);
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? result : [];
  } catch {
    const response = await apiClient.get(`/reserva/obtenerReservasPorEmpresa/${id}`);
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? result : [];
  }
};

export const listarReservasPorViaje = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/reserva/viaje/${id}`);
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? result : [];
  } catch {
    const response = await apiClient.get(`/reserva/listarReservasPorViaje/${id}`);
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? result : [];
  }
};

export const eliminarReserva = async (id: number) => {
  try {
    const response = await apiClient.delete(`/api/reserva/${id}`);
    return response.data?.data ?? response.data;
  } catch (error: any) {
    try {
      const response = await apiClient.put(`/reserva/eliminarReserva/${id}`, {});
      return response.data?.data ?? response.data;
    } catch {
      console.error(
        "Error al eliminar la reserva",
        error.response?.data || error.message
      );
      throw error;
    }
  }
};

export const listarReservasYPasajerosPorViaje = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/reserva/viaje/${id}/pasajeros`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get(
      `/reserva/listarReservasYPasajerosPorViaje/${id}`
    );
    return response.data?.data ?? response.data;
  }
};

export const eliminarPasajero = async (id: number) => {
  try {
    const response = await apiClient.delete(`/api/reserva/pasajero/${id}`);
    return response.data?.data ?? response.data;
  } catch (error: any) {
    try {
      const response = await apiClient.put(`/reserva/eliminarPasajero/${id}`, {});
      return response.data?.data ?? response.data;
    } catch {
      console.error(
        "Error al eliminar pasajero",
        error.response?.data || error.message
      );
      throw error;
    }
  }
};
