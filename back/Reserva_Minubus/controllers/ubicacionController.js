const ubicacionService = require("../services/ubicacionService");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const appLogger = require("../utils/logger");

exports.obtenerLocalidades = async (req, res) => {
  try {
    const localidades = await ubicacionService.getLocalidades();
    appLogger.info("locations_listed", {
      requestId: req.requestId,
      count: localidades.length,
    });
    sendSuccess(res, localidades);
  } catch (error) {
    appLogger.error("locations_list_failed", {
      requestId: req.requestId,
      ...appLogger.errorDetails(error),
    });
    sendError(res, "Error al obtener localidades", 500, error);
  }
};

exports.obtenerProvincias = async (req, res) => {
  try {
    const provincias = await ubicacionService.getProvincias();
    sendSuccess(res, provincias);
  } catch (error) {
    sendError(res, "Error al obtener provincias", 500, error);
  }
};

exports.obtenerLocalidadesId = async (req, res) => {
  try {
    const localidad = await ubicacionService.getLocalidadById(req.params.id);
    if (!localidad) return sendError(res, "Localidad no encontrada", 404);
    sendSuccess(res, localidad);
  } catch (error) {
    sendError(res, "Error al obtener localidad", 500, error);
  }
};

exports.obtenerProvinciasId = async (req, res) => {
  try {
    const provincia = await ubicacionService.getProvinciaById(req.params.id);
    if (!provincia) return sendError(res, "Provincia no encontrada", 404);
    sendSuccess(res, provincia);
  } catch (error) {
    sendError(res, "Error al obtener provincia", 500, error);
  }
};
