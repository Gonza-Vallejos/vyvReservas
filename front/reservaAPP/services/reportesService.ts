import { apiClient } from "./apiClient";

const fetchReporte = async (url: string, label: string) => {
  try {
    const response = await apiClient.get(url);
    return response.data;
  } catch (error: any) {
    console.error(
      `Error al ${label}`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerPasajerosPorViaje = async (id: number) =>
  fetchReporte(`/reportes/obtenerPasajerosPorViaje/${id}`, "obtener pasajeros por viaje");

export const obtenerViajesMasReservadosPorEmpresa = async (id: number) =>
  fetchReporte(
    `/reportes/obtenerViajesMasReservadosPorEmpresa/${id}`,
    "obtener viajes mas reservados por empresa"
  );

export const obtenerViajesPorTransporteDeEmpresa = async (id: number) =>
  fetchReporte(
    `/reportes/obtenerViajesPorTransporteDeEmpresa/${id}`,
    "obtener viajes por transporte de empresa"
  );

export const obtenerPasajerosPorEmpresa = async (id: number) =>
  fetchReporte(
    `/reportes/obtenerPasajerosPorEmpresa/${id}`,
    "obtener pasajeros por empresa"
  );

export const obtenerClientesConMasReservasPorEmpresa = async (id: number) =>
  fetchReporte(
    `/reportes/obtenerClientesConMasReservasPorEmpresa/${id}`,
    "obtener clientes con mas reservas por empresa"
  );

export const obtenerClientesConVentasConfirmadasPorEmpresa = async (
  id: number
) =>
  fetchReporte(
    `/reportes/obtenerClientesConVentasConfirmadasPorEmpresa/${id}`,
    "obtener clientes con ventas confirmadas por empresa"
  );

export const obtenerGananciaTotalPorEmpresa = async (id: number) =>
  fetchReporte(
    `/reportes/obtenerGananciaTotalPorEmpresa/${id}`,
    "obtener ganancia total por empresa"
  );

export const obtenerGananciasPorViajePorEmpresa = async (id: number) =>
  fetchReporte(
    `/reportes/obtenerGananciasPorViajePorEmpresa/${id}`,
    "obtener ganancia total por viaje por empresa"
  );

export const obtenerUsuariosConReservasSinVenta = async (id: number) =>
  fetchReporte(
    `/reportes/obtenerUsuariosConReservasSinVenta/${id}`,
    "obtener usuarios con reservas sin venta"
  );
