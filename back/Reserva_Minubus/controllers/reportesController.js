const reportesService = require("../services/reportesService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

exports.obtenerClientesConVentasConfirmadasPorEmpresa = async (req, res) => {
  try {
    const data = await reportesService.getTopClientes(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, "Error al obtener reporte de clientes", 500, error);
  }
};

exports.obtenerGananciaTotalPorEmpresa = async (req, res) => {
  try {
    const data = await reportesService.getGananciaTotal(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, "Error al obtener ganancia total", 500, error);
  }
};

exports.obtenerGananciasPorViajePorEmpresa = async (req, res) => {
  try {
    const data = await reportesService.getGananciasPorViaje(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, "Error al obtener ganancias por viaje", 500, error);
  }
};

exports.obtenerUsuariosConReservasSinVenta = async (req, res) => {
  try {
    const data = await reportesService.getReservasSinVenta(req.params.id);
    sendSuccess(res, data);
  } catch (error) {
    sendError(res, "Error al obtener reservas sin venta", 500, error);
  }
};
