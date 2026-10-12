const transporteService = require("../services/medioTransporteService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

exports.obtenerTransportes = async (req, res) => {
  try {
    const transportes = await transporteService.getAll();
    sendSuccess(res, transportes);
  } catch (error) {
    sendError(res, "Error al obtener los transportes", 500, error);
  }
};

exports.obtenerTransportesPorEmpresa = async (req, res) => {
  try {
    const transportes = await transporteService.getByEmpresa(req.params.id);
    sendSuccess(res, transportes);
  } catch (error) {
    sendError(res, "Error al obtener transportes por empresa", 500, error);
  }
};

exports.obtenerTransportePorId = async (req, res) => {
  try {
    const transporte = await transporteService.getById(req.params.id);
    if (!transporte) return sendError(res, "Transporte no encontrado", 404);
    sendSuccess(res, transporte);
  } catch (error) {
    sendError(res, "Error al obtener el transporte", 500, error);
  }
};

exports.crearTransporte = async (req, res) => {
  try {
    const nuevo = await transporteService.create(req.body);
    sendSuccess(res, nuevo, "Transporte creado", 201);
  } catch (error) {
    sendError(res, "Error al crear el transporte", 500, error);
  }
};

exports.actualizarTransporte = async (req, res) => {
  try {
    const actualizado = await transporteService.update(req.params.id, req.body);
    if (!actualizado) return sendError(res, "Transporte no encontrado o sin cambios", 404);
    sendSuccess(res, null, "Transporte actualizado y viajes futuros modificados correctamente");
  } catch (error) {
    sendError(res, "Error al actualizar el transporte", 500, error);
  }
};

exports.eliminarTransporte = async (req, res) => {
  try {
    await transporteService.delete(req.params.id);
    sendSuccess(res, null, "Transporte eliminado correctamente");
  } catch (error) {
    if (error.message === "CANNOT_DELETE_WITH_TRIPS") {
      return sendError(res, "No se puede eliminar el transporte porque tiene viajes asignados.", 400);
    }
    sendError(res, "Error al eliminar el transporte", 500, error);
  }
};

exports.obtenerViajesPorTransporte = async (req, res) => {
  try {
    const viajes = await transporteService.getTrips(req.params.id);
    sendSuccess(res, viajes, viajes.length === 0 ? "No hay viajes asignados" : "Viajes obtenidos");
  } catch (error) {
    sendError(res, "Error al obtener viajes del transporte", 500, error);
  }
};

exports.verificarTransporteSinReservas = async (req, res) => {
  try {
    const sinReservas = await transporteService.checkNoReservations(req.params.id);
    sendSuccess(res, { sinReservas }, sinReservas ? "Sin reservas futuras" : "Tiene reservas futuras");
  } catch (error) {
    sendError(res, "Error al verificar reservas", 500, error);
  }
};
