import { apiClient } from "./apiClient";

export const crearVenta = async (ventaData: any) => {
  try {
    const response = await apiClient.post("/ventas/crearVenta/", ventaData);
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al crear la venta",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerVentaDetalle = async (id: number) => {
  const response = await apiClient.get(
    `/ventas/obtenerVentaDetalleGeneral/${id}`
  );
  return response.data;
};

export const existeReservaVenta = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/ventas/existeReservaVenta/${id}`);
    return response.data?.existe === true;
  } catch (error) {
    console.error(
      "Error al verificar si existe la venta para la reserva:",
      error
    );
    return false;
  }
};

export const existeVentaPorPasajero = async (
  idPasajero: number
): Promise<boolean> => {
  try {
    const response = await apiClient.get(
      `/ventas/existePasajeroVenta/${idPasajero}`
    );
    return response.data?.existe === true;
  } catch (error) {
    console.error("Error al verificar si el pasajero tiene venta:", error);
    return false;
  }
};
