const empresaService = require("../services/empresaService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

// Obtener todas las empresas
exports.obtenerEmpresas = async (req, res) => {
  try {
    const empresas = await empresaService.getAll();
    sendSuccess(res, empresas);
  } catch (error) {
    sendError(res, "Error al obtener las empresas", 500, error);
  }
};

// Obtener una Empresa por ID
exports.obtenerEmpresaId = async (req, res) => {
  try {
    const empresa = await empresaService.getById(req.params.id);
    if (!empresa) {
      return sendError(res, "Empresa no encontrada", 404);
    }
    sendSuccess(res, empresa);
  } catch (error) {
    sendError(res, "Error al obtener la Empresa", 500, error);
  }
};

// Crear una nueva empresa
exports.crearEmpresa = async (req, res) => {
  try {
    const nuevaEmpresa = await empresaService.create(req.body);
    sendSuccess(res, nuevaEmpresa, "Empresa creada correctamente", 201);
  } catch (error) {
    sendError(res, "Error al crear la empresa", 500, error);
  }
};

// Actualizar una empresa existente
exports.actualizarEmpresa = async (req, res) => {
  try {
    const actualizado = await empresaService.update(req.params.id, req.body);
    if (!actualizado) {
      return sendError(res, "Empresa no encontrada o sin cambios", 404);
    }
    sendSuccess(res, null, "Empresa actualizada");
  } catch (error) {
    sendError(res, "Error al actualizar la empresa", 500, error);
  }
};

// Eliminar una empresa
exports.eliminarEmpresa = async (req, res) => {
  try {
    const eliminado = await empresaService.delete(req.params.id);
    if (!eliminado) {
      return sendError(res, "Empresa no encontrada", 404);
    }
    sendSuccess(res, null, "Empresa eliminada");
  } catch (error) {
    sendError(res, "Error al eliminar la empresa", 500, error);
  }
};
