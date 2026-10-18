const reservaService = require("../services/reservaService");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const appLogger = require("../utils/logger");

exports.obtenerReservas = async (req, res) => {
  try {
    const reservas = await reservaService.getAll();
    sendSuccess(res, reservas);
  } catch (error) {
    sendError(res, "Error al obtener las reservas", 500, error);
  }
};

exports.obtenerReservaPorId = async (req, res) => {
  try {
    const reserva = await reservaService.getById(req.query.id || req.params.id);
    if (!reserva) return sendError(res, "Reserva no encontrada", 404);
    sendSuccess(res, reserva);
  } catch (error) {
    sendError(res, "Error al obtener la reserva", 500, error);
  }
};

exports.obtenerReservasPorUsuario = async (req, res) => {
  try {
    const usuarioId = req.query.id || req.usuario?.id;
    const reservas = await reservaService.getByUsuario(usuarioId);
    sendSuccess(res, reservas);
  } catch (error) {
    sendError(res, "Error al obtener las reservas del usuario", 500, error);
  }
};

exports.crearReserva = async (req, res) => {
  appLogger.info("reservation_create_started", {
    requestId: req.requestId,
    userId: req.usuario?.id,
    perfil: req.usuario?.perfil,
    bodyUserId: req.body?.usuarios_id,
    viajeId: req.body?.viajes_id,
    pasajeros: req.body?.pasajeros?.length || req.body?.personas?.length,
  });
  try {
    const { pasajeros, ...reservaData } = req.body;
    const listaPasajeros = pasajeros || reservaData.personas || [];
    const nuevaReserva = await reservaService.create(reservaData, listaPasajeros);
    sendSuccess(res, nuevaReserva, "Reserva creada correctamente", 201);
  } catch (error) {
    appLogger.error("reservation_create_failed", {
      requestId: req.requestId,
      userId: req.usuario?.id,
      viajeId: req.body?.viajes_id,
      ...appLogger.errorDetails(error),
    });
    if (error.code === "SEAT_ALREADY_TAKEN" || error.name === "SeatAlreadyTakenError" || error.status === 409) {
      return sendError(res, error.message, 409, {
        code: "SEAT_ALREADY_TAKEN",
        asientosEnConflicto: error.asientosEnConflicto || []
      });
    }
    if (error.message === "NO_AVAILABILITY" || error.code === "NO_AVAILABILITY") {
      return sendError(res, "No hay lugares disponibles para este viaje", 400);
    }
    sendError(res, error.message || "Error al crear la reserva", error.status || 500, error);
  }
};

exports.actualizarReserva = async (req, res) => {
  try {
    const actualizado = await reservaService.update(req.params.id, req.body);
    if (!actualizado) return sendError(res, "Reserva no encontrada", 404);
    sendSuccess(res, null, "Reserva actualizada");
  } catch (error) {
    sendError(res, "Error al actualizar la reserva", 500, error);
  }
};

exports.eliminarReserva = async (req, res) => {
  try {
    const eliminado = await reservaService.delete(req.params.id);
    if (!eliminado) return sendError(res, "Reserva no encontrada", 404);
    sendSuccess(res, null, "Reserva eliminada");
  } catch (error) {
    sendError(res, "Error al eliminar la reserva", 500, error);
  }
};

exports.eliminarPasajero = async (req, res) => {
  try {
    const eliminado = await reservaService.deletePasajero(req.params.id);
    if (!eliminado) return sendError(res, "Pasajero no encontrado", 404);
    sendSuccess(res, null, "Pasajero eliminado de la reserva");
  } catch (error) {
    sendError(res, "Error al eliminar el pasajero", 500, error);
  }
};

exports.listarPasajerosPorReserva = async (req, res) => {
  try {
    const pasajeros = await reservaService.getPasajerosByReserva(req.params.id);
    sendSuccess(res, pasajeros);
  } catch (error) {
    sendError(res, "Error al obtener pasajeros de la reserva", 500, error);
  }
};

exports.listarTodosLosPasajeros = async (req, res) => {
  try {
    const { Pasajeros: ModelPasajeros } = require("../models");
    const pasajeros = await ModelPasajeros.findAll({ where: { eliminado: "no" } });
    sendSuccess(res, pasajeros);
  } catch (error) {
    sendError(res, "Error al listar pasajeros", 500, error);
  }
};

exports.listarPasajeroPorId = async (req, res) => {
  try {
    const { Pasajeros: ModelPasajeros } = require("../models");
    const pasajero = await ModelPasajeros.findByPk(req.params.id);
    if (!pasajero) return sendError(res, "Pasajero no encontrado", 404);
    sendSuccess(res, pasajero);
  } catch (error) {
    sendError(res, "Error al obtener pasajero", 500, error);
  }
};

exports.listarPasajerosPorViaje = async (req, res) => {
  try {
    const pasajeros = await reservaService.getPasajerosByViaje(req.params.id);
    sendSuccess(res, pasajeros);
  } catch (error) {
    sendError(res, "Error al obtener pasajeros del viaje", 500, error);
  }
};

exports.obtenerReservasPorEmpresa = async (req, res) => {
  try {
    const reservas = await reservaService.getReservasByEmpresa(req.params.id);
    sendSuccess(res, reservas);
  } catch (error) {
    sendError(res, "Error al obtener reservas por empresa", 500, error);
  }
};

exports.listarReservasYPasajerosPorViaje = async (req, res) => {
  try {
    const { Reserva: ModelReserva, Pasajeros: ModelPasajeros } = require("../models");
    const reservas = await ModelReserva.findAll({
      where: { viajes_id: req.params.id, eliminado: "no" },
      include: { model: ModelPasajeros, where: { eliminado: "no" } }
    });
    const result = reservas.map(r => ({
      reservaId: r.id,
      fechaReserva: r.fechaReserva,
      usuarios_id: r.usuarios_id,
      pasajeros: r.Pasajeros
    }));
    sendSuccess(res, result);
  } catch (error) {
    sendError(res, "Error al obtener reservas y pasajeros del viaje", 500, error);
  }
};
