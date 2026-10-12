const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/responseHandler");

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return sendError(res, "Token no proporcionado", 401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
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
      return sendError(res, "Acceso denegado: perfil no autorizado", 403);
    }

    next();
  };
};

module.exports = { autenticarToken, permitirPerfiles };
