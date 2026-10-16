const usuarioEmpresaService = require("../services/usuarioEmpresaService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

exports.asociarUsuarioEmpresa = async (req, res) => {
  try {
    await usuarioEmpresaService.associate(req.params.id, req.params.empresaId);
    sendSuccess(res, null, "Usuario asociado a la empresa correctamente");
  } catch (error) {
    if (error.message === "NOT_FOUND") return sendError(res, "Usuario o empresa no encontrados", 404);
    if (error.message === "ALREADY_ASSOCIATED") return sendError(res, "El usuario ya está asociado a otra empresa", 400);
    sendError(res, "Error al asociar usuario y empresa", 500, error);
  }
};

exports.desasociarUsuarioEmpresa = async (req, res) => {
  try {
    await usuarioEmpresaService.dissociate(req.params.id);
    sendSuccess(res, null, "Usuario desasociado de la empresa correctamente");
  } catch (error) {
    if (error.message === "NOT_ASSOCIATED") return sendError(res, "El usuario no está asociado a ninguna empresa", 400);
    sendError(res, "Error al desasociar usuario de la empresa", 500, error);
  }
};

exports.obtenerEmpresaDeUsuario = async (req, res) => {
  try {
    const empresaId = await usuarioEmpresaService.getEmpresaByUsuario(req.params.id);
    sendSuccess(res, { empresa_id: empresaId }, empresaId ? "Asociación encontrada" : "Sin asociación");
  } catch (error) {
    sendError(res, "Error al verificar asociación del usuario", 500, error);
  }
};

exports.obtenerUsuariosPorEmpresa = async (req, res) => {
  try {
    const usuarios = await usuarioEmpresaService.getUsuariosByEmpresa(req.params.id);
    sendSuccess(res, usuarios || []);
  } catch (error) {
    sendError(res, "Error al obtener los usuarios de la empresa", 500, error);
  }
};
