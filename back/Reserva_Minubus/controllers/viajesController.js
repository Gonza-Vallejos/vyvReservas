const viajesService = require("../services/viajesService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

exports.obtenerViajes = async (req, res) => {
  try {
    const viajes = await viajesService.getAll();
    sendSuccess(res, viajes);
  } catch (error) {
    sendError(res, "Error al obtener los viajes", 500, error);
  }
};

exports.obtenerViajePorId = async (req, res) => {
  try {
    const viaje = await viajesService.getById(req.params.id);
    if (!viaje) return sendError(res, "Viaje no encontrado", 404);
    sendSuccess(res, viaje);
  } catch (error) {
    sendError(res, "Error al obtener el viaje", 500, error);
  }
};

exports.obtenerViajesDisponibles = async (req, res) => {
  try {
    const { origen, destino, fecha } = req.query;
    const viajes = await viajesService.getAvailable(origen, destino, fecha);
    sendSuccess(res, viajes);
  } catch (error) {
    console.error('Error en búsqueda de viajes:', error);
    sendError(res, "Error al obtener viajes disponibles", 500, error);
  }
};

exports.crearViaje = async (req, res) => {
  try {
    const nuevo = await viajesService.create(req.body);
    sendSuccess(res, nuevo, "Viaje creado exitosamente", 201);
  } catch (error) {
    const messages = {
      "INVALID_TRANSPORTE": "El medio de transporte no es válido",
      "INVALID_CHOFER": "El usuario no es válido o no tiene perfil de chofer",
      "EMPRESA_MISMATCH": "El usuario no pertenece a la misma empresa que el medio de transporte"
    };
    sendError(res, messages[error.message] || "Error al crear el viaje", 400, error);
  }
};

exports.actualizarViajes = async (req, res) => {
  try {
    const actualizado = await viajesService.update(req.params.id, req.body);
    if (!actualizado) return sendError(res, "Viaje no encontrado", 404);
    sendSuccess(res, null, "Viaje actualizado");
  } catch (error) {
    const messages = {
      "INVALID_TRANSPORTE": "El medio de transporte no es válido",
      "INVALID_CHOFER": "El usuario seleccionado no tiene perfil de chofer",
      "EMPRESA_MISMATCH": "El chofer y el medio de transporte deben pertenecer a la misma empresa"
    };
    sendError(res, messages[error.message] || "Error al actualizar el viaje", 400, error);
  }
};

exports.eliminarViajes = async (req, res) => {
  try {
    await viajesService.delete(req.params.id);
    sendSuccess(res, null, "Viaje eliminado");
  } catch (error) {
    const messages = {
      "TRIP_ALREADY_HAPPENED": "No se puede eliminar un viaje que ya ocurrió",
      "HAS_RESERVATIONS": "No se puede eliminar el viaje porque tiene reservas asignadas."
    };
    sendError(res, messages[error.message] || "Error al eliminar el viaje", 400, error);
  }
};

exports.obtenerViajesPorEmpresa = async (req, res) => {
  try {
    const viajes = await viajesService.getByEmpresa(req.params.id);
    sendSuccess(res, viajes);
  } catch (error) {
    sendError(res, "Error al obtener viajes de la empresa", 500, error);
  }
};

exports.obtenerViajesPorChofer = async (req, res) => {
  try {
    const viajes = await viajesService.getByChofer(req.params.id);
    sendSuccess(res, viajes);
  } catch (error) {
    sendError(res, "Error al obtener viajes del chofer", 500, error);
  }
};

exports.existeReservaParaViaje = async (req, res) => {
  try {
    const existe = await viajesService.hasReservations(req.params.id);
    sendSuccess(res, { existe });
  } catch (error) {
    sendError(res, "Error al verificar reserva", 500, error);
  }
};

exports.obtenerAsientosOcupados = async (req, res) => {
  try {
    const asientos = await viajesService.getAsientosOcupados(req.params.id);
    if (!asientos) return sendError(res, "Viaje no encontrado", 404);
    sendSuccess(res, asientos);
  } catch (error) {
    sendError(res, "Error al obtener asientos ocupados", 500, error);
  }
};
