const ventasService = require("../services/ventasService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

exports.obtenerVentas = async (req, res) => {
  try {
    const ventas = await ventasService.getAll();
    sendSuccess(res, ventas);
  } catch (error) {
    sendError(res, "Error al obtener las ventas", 500, error);
  }
};

exports.obtenerVentasPorId = async (req, res) => {
  try {
    const venta = await ventasService.getById(req.params.id);
    if (!venta) return sendError(res, "Venta no encontrada", 404);
    sendSuccess(res, venta);
  } catch (error) {
    sendError(res, "Error al obtener la venta", 500, error);
  }
};

exports.crearVenta = async (req, res) => {
  try {
    const { detalle, ...ventaData } = req.body;
    const nuevaVenta = await ventasService.create(ventaData, detalle);
    sendSuccess(res, nuevaVenta, "Venta creada correctamente", 201);
  } catch (error) {
    sendError(res, "Error al crear la venta", 500, error);
  }
};

exports.actualizarVentas = async (req, res) => {
  try {
    const actualizado = await ventasService.update(req.params.id, req.body);
    if (!actualizado) return sendError(res, "Venta no encontrada", 404);
    sendSuccess(res, null, "Venta actualizada");
  } catch (error) {
    sendError(res, "Error al actualizar la venta", 500, error);
  }
};

exports.eliminarVentas = async (req, res) => {
  try {
    const eliminado = await ventasService.delete(req.params.id);
    if (!eliminado) return sendError(res, "Venta no encontrada", 404);
    sendSuccess(res, null, "Venta eliminada");
  } catch (error) {
    sendError(res, "Error al eliminar la venta", 500, error);
  }
};

exports.obtenerVentaDetalle = async (req, res) => {
  try {
    const venta = await ventasService.getVentaDetalle(req.params.id);
    if (!venta) return sendError(res, "Venta no encontrada para esta reserva", 404);
    sendSuccess(res, venta);
  } catch (error) {
    sendError(res, "Error al obtener detalle de la venta", 500, error);
  }
};

exports.obtenerVentaDetalleGeneral = async (req, res) => {
  try {
    const venta = await ventasService.getVentaDetalleGeneral(req.params.id);
    if (!venta) return sendError(res, "Información no encontrada", 404);
    sendSuccess(res, venta);
  } catch (error) {
    sendError(res, "Error al obtener detalle general", 500, error);
  }
};

exports.existeReservaVenta = async (req, res) => {
  try {
    const existe = await ventasService.checkExistByReserva(req.params.id);
    sendSuccess(res, { existe });
  } catch (error) {
    sendError(res, "Error al verificar venta", 500, error);
  }
};

exports.existeVentaPorPasajero = async (req, res) => {
  try {
    const existe = await ventasService.checkExistByPasajero(req.params.id);
    sendSuccess(res, { existe });
  } catch (error) {
    sendError(res, "Error al verificar venta por pasajero", 500, error);
  }
};
