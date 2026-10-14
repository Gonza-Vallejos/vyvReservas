const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/responseHandler");
const appLogger = require("../utils/logger");

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    appLogger.warn("auth_missing_token", { requestId: req.requestId, path: req.originalUrl });
    return sendError(res, "Token no proporcionado", 401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      appLogger.warn("auth_invalid_token", {
        requestId: req.requestId,
        path: req.originalUrl,
        errorMessage: err.message,
      });
      return sendError(res, "Token inválido o expirado", 403);
    }

    req.usuario = usuario;
    next();
  });
};

const permitirPerfiles = (...perfilesPermitidos) => {
  return (req, res, next) => {
    // El usuario ya viene en la req gracias a autenticarToken
    if (!req.usuario || !perfilesPermitidos.includes(req.usuario.perfil)) {
      appLogger.warn("profile_access_denied", {
        requestId: req.requestId,
        path: req.originalUrl,
        userId: req.usuario?.id,
        perfil: req.usuario?.perfil,
        perfilesPermitidos,
      });
      return sendError(res, "Acceso denegado: perfil no autorizado", 403);
    }

    next();
  };
};

module.exports = { autenticarToken, permitirPerfiles };
