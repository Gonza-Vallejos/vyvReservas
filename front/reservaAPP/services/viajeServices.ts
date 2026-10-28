import { apiClient } from "./apiClient";

export const listarViajes = async (
  origen?: string,
  destino?: string,
  fecha?: string
) => {
  const params: Record<string, string> = {};
  if (origen && origen.trim()) params.origen = origen.trim();
  if (destino && destino.trim()) params.destino = destino.trim();
  if (fecha && fecha.trim()) params.fecha = fecha.trim();

  try {
    const response = await apiClient.get("/api/viajes/disponibles", { params });
    const result = response.data?.data ?? response.data;
    return Array.isArray(result) ? result : [];
  } catch (err) {
    // Fallback de compatibilidad
    try {
      const response = await apiClient.get("/viajes/disponibles", { params });
      const result = response.data?.data ?? response.data;
      return Array.isArray(result) ? result : [];
    } catch {
      throw err;
    }
  }
};

export const obtenerViajesId = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/viajes/${id}`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get(`/viajes/obtenerViajesId/${id}`);
    return response.data?.data ?? response.data;
  }
};

export const obtenerPasajerosPorViaje = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/reserva/viaje/${id}/pasajeros`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get(`/reserva/listarPasajerosPorReserva/${id}`);
    return response.data?.data ?? response.data;
  }
};

export const obtenerLocalidades = async () => {
  try {
    const response = await apiClient.get("/api/ubicacion/localidades");
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get("/ubicacion/obtenerLocalidad/");
    return response.data?.data ?? response.data;
  }
};

export const obtenerProvincias = async () => {
  try {
    const response = await apiClient.get("/api/ubicacion/provincias");
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get("/ubicacion/obtenerProvincia/");
    return response.data?.data ?? response.data;
  }
};

export const obtenerLocalidadesId = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/ubicacion/localidades/${id}`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get(`/ubicacion/obtenerLocalidadesId/${id}`);
    return response.data?.data ?? response.data;
  }
};

export const obtenerProvinciasId = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/ubicacion/provincias/${id}`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get(`/ubicacion/obtenerProvinciasId/${id}`);
    return response.data?.data ?? response.data;
  }
};

export const obtenerVentaDetalle = async (id: number) => {
  const response = await apiClient.get(`/api/ventas/detalle/${id}`);
  return response.data?.data ?? response.data;
};

export const obtenerViajesPorChofer = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/viajes/chofer/${id}`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get(`/viajes/obtenerViajesPorChofer/${id}`);
    return response.data?.data ?? response.data;
  }
};

export const obtenerViajesPorEmpresa = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/viajes/empresa/${id}`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get(`/viajes/obtenerViajesPorEmpresa/${id}`);
    return response.data?.data ?? response.data;
  }
};

export const crearViaje = async (viajeData: any) => {
  try {
    const response = await apiClient.post("/api/viajes", viajeData);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.post("/viajes/crearViaje", viajeData);
    return response.data?.data ?? response.data;
  }
};

export const eliminarViaje = async (id: any) => {
  try {
    const response = await apiClient.delete(`/api/viajes/${id}`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.put(`/viajes/eliminarViaje/${id}`, {});
    return response.data?.data ?? response.data;
  }
};

export const actualizarViaje = async (id: number, viajeData: any) => {
  try {
    const response = await apiClient.put(`/api/viajes/${id}`, viajeData);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.put(`/viajes/actualizarViaje/${id}`, viajeData);
    return response.data?.data ?? response.data;
  }
};

export const existeReservaViaje = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.get(`/api/viajes/existe-reserva/${id}`);
    const res = response.data?.data ?? response.data;
    return res?.existe === true || res === true;
  } catch (error) {
    console.error("Error al verificar si existe reserva:", error);
    return false;
  }
};

export const obtenerAsientosOcupados = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/viajes/${id}/asientos`);
    return response.data?.data ?? response.data;
  } catch {
    const response = await apiClient.get(`/viajes/asientos/${id}`);
    return response.data?.data ?? response.data;
  }
};
