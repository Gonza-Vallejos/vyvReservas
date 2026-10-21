import { apiClient } from "./apiClient";

export const crearPreferencia = async (reserva_id: number | string) => {
  const response = await apiClient.post("/pagos/crear-preferencia", {
    reserva_id,
  });
  return response.data;
};

export const obtenerEstadoPago = async (reservaId: number | string) => {
  const response = await apiClient.get(`/pagos/estado/${reservaId}`);
  return response.data;
};

export const reintentarPago = async (reservaId: number | string) => {
  const response = await apiClient.post(`/pagos/reintentar/${reservaId}`);
  return response.data;
};
