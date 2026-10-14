import { apiClient } from "./apiClient";

export const listarViajes = async (origen: string, destino: string) => {
  const response = await apiClient.get("/viajes/viajesDisponible", {
    params: { origen, destino },
  });
  return response.data;
};

export const obtenerViajesId = async (id: number) => {
  const response = await apiClient.get(`/viajes/obtenerViajesId/${id}`);
  return response.data;
};

export const obtenerPasajerosPorViaje = async (id: number) => {
  const response = await apiClient.get(
    `/reserva/listarPasajerosPorReserva/${id}`
  );
  return response.data;
};

export const obtenerLocalidades = async () => {
  const response = await apiClient.get("/ubicacion/obtenerLocalidad/");
  return response.data;
};

export const obtenerProvincias = async () => {
  const response = await apiClient.get("/ubicacion/obtenerProvincia/");
  return response.data;
};

export const obtenerLocalidadesId = async (id: number) => {
  const response = await apiClient.get(`/ubicacion/obtenerLocalidadesId/${id}`);
  return response.data;
};

export const obtenerProvinciasId = async (id: number) => {
  const response = await apiClient.get(`/ubicacion/obtenerProvinciasId/${id}`);
  return response.data;
};

export const obtenerVentaDetalle = async (id: number) => {
  const response = await apiClient.get(`/viajes/obtenerVentasViajesId/${id}`);
  return response.data;
};

export const obtenerViajesPorChofer = async (id: number) => {
  const response = await apiClient.get(`/viajes/obtenerViajesPorChofer/${id}`);
  return response.data;
};

export const obtenerViajesPorEmpresa = async (id: number) => {
  const response = await apiClient.get(`/viajes/obtenerViajesPorEmpresa/${id}`);
  return response.data;
};

export const crearViaje = async (viajeData: any) => {
  const response = await apiClient.post("/viajes/crearViaje", viajeData);
  return response.data;
};

export const eliminarViaje = async (id: any) => {
  const response = await apiClient.put(`/viajes/eliminarViaje/${id}`, {});
  return response.data;
};

export const actualizarViaje = async (id: number, viajeData: any) => {
  const response = await apiClient.put(
    `/viajes/actualizarViaje/${id}`,
    viajeData
  );
  return response.data;
};

export const existeReservaViaje = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/viajes/existeReservaViaje/${id}`);
    return response.data?.existe === true;
  } catch (error) {
    console.error(
      "Error al verificar si existe la reserva para el viaje:",
      error
    );
    return false;
  }
};
