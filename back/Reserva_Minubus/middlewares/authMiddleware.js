/**
 * Authentication and Authorization Middleware
 * Uses the new permissions system
 */
const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/responseHandler");
const appLogger = require("../utils/logger");
const { 
  PROFILES, 
  hasPermission, 
  canAccessResource,
  isAtLeastProfile,
  getProfileName 
} = require("../constants/permissions");

/**
 * Authenticate token - extracts and verifies JWT
 */
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

    // Attach normalized user to request
    req.usuario = {
      ...usuario,
      perfil: usuario.perfil || getProfileName(usuario.perfil_id),
      perfil_id: Number(usuario.perfil_id),
    };
    next();
  });
};

/**
 * Middleware factory for profile-based access control
 * @param {...number|string} perfilesPermitidos - Profile IDs or names allowed
 * 
 * @example
 * // Allow only admin (ID 1)
 * permitirPerfiles(1)
 * 
 * // Allow admin and empresa
 * permitirPerfiles(1, 5)
 * 
 * // Allow by name
 * permitirPerfiles('usuarioAdministrador', 'usuarioEmpresa')
 */
const permitirPerfiles = (...perfilesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return sendError(res, "No autenticado", 401);
    }

    const userProfileId = req.usuario.perfil_id;
    
    // Convert names to IDs if needed
    const allowedIds = perfilesPermitidos.map(p => {
      if (typeof p === 'string') {
        return Number(Object.keys(PROFILES).find(k => PROFILES[k] === p || k.toLowerCase() === p.toLowerCase()));
      }
      return Number(p);
    }).filter(Boolean);

    if (allowedIds.length === 0) {
      appLogger.error("permitirPerfiles: no valid profiles specified", {
        requestId: req.requestId,
        perfiles: perfilesPermitidos,
      });
      return sendError(res, "Error de configuración del servidor", 500);
    }

    if (!allowedIds.includes(userProfileId)) {
      appLogger.warn("profile_access_denied", {
        requestId: req.requestId,
        path: req.originalUrl,
        userId: req.usuario.id,
        perfil: req.usuario.perfil,
        perfilesEsperados: perfilesPermitidos,
      });
      return sendError(res, "Acceso denegado: perfil no autorizado", 403);
    }

    next();
  };
};

/**
 * Middleware factory for permission-based access control
 * @param {string} permission - Permission in resource:action format
 * 
 * @example
 * // Require users:read permission
 * requirePermission('users:read')
 * 
 * // Require users:write permission
 * requirePermission('users:write')
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return sendError(res, "No autenticado", 401);
    }

    const profileId = req.usuario.perfil_id;
    
    if (!hasPermission(profileId, permission)) {
      appLogger.warn("permission_denied", {
        requestId: req.requestId,
        path: req.originalUrl,
        userId: req.usuario.id,
        perfil: req.usuario.perfil,
        permissionRequired: permission,
      });
      return sendError(res, "Acceso denegado: permiso insuficiente", 403);
    }

    next();
  };
};

/**
 * Middleware factory for resource ownership check
 * @param {string} ownerField - Field name in the resource that contains owner ID
 * 
 * @example
 * // Check if user owns the company they're trying to modify
 * requireOwnership('empresa_id')
 */
const requireOwnership = (ownerField = 'empresa_id') => {
  return (req, res, next) => {
    if (!req.usuario) {
      return sendError(res, "No autenticado", 401);
    }

    const profileId = req.usuario.perfil_id;
    const resourceOwnerId = req.params[ownerField] || req.body[ownerField] || req[ownerField];

    // Admin bypasses ownership check
    if (profileId === PROFILES.ADMINISTRADOR) {
      return next();
    }

    // For empresa, mostrador, chofer - check if resource belongs to their company
    if ([PROFILES.EMPRESA, PROFILES.MOSTRADOR, PROFILES.CHOFER].includes(profileId)) {
      if (!req.usuario.id_empresa) {
        return sendError(res, "No tienes una empresa asociada", 403);
      }
      
      if (resourceOwnerId && Number(req.usuario.id_empresa) !== Number(resourceOwnerId)) {
        appLogger.warn("ownership_denied", {
          requestId: req.requestId,
          path: req.originalUrl,
          userId: req.usuario.id,
          userEmpresa: req.usuario.id_empresa,
          resourceOwner: resourceOwnerId,
        });
        return sendError(res, "No tienes acceso a este recurso", 403);
      }
    }

    next();
  };
};

/**
 * Middleware factory for minimum profile level
 * @param {number|string} minProfile - Minimum profile ID or name required
 * 
 * @example
 * // Require at least empresa level
 * requireMinProfile(PROFILES.EMPRESA)
 * // or
 * requireMinProfile('usuarioEmpresa')
 */
const requireMinProfile = (minProfile) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return sendError(res, "No autenticado", 401);
    }

    const userProfileId = req.usuario.perfil_id;
    
    let minProfileId;
    if (typeof minProfile === 'string') {
      minProfileId = PROFILES[minProfile.toUpperCase()];
    } else {
      minProfileId = Number(minProfile);
    }

    if (!isAtLeastProfile(userProfileId, minProfileId)) {
      appLogger.warn("min_profile_not_met", {
        requestId: req.requestId,
        path: req.originalUrl,
        userId: req.usuario.id,
        perfil: req.usuario.perfil,
        minProfileRequired: minProfileId,
      });
      return sendError(res, "Acceso denegado: nivel de perfil insuficiente", 403);
    }

    next();
  };
};

/**
 * Combines multiple middleware for complex authorization
 * @param {Object} options
 * @param {string[]} [options.perfiles] - Required profiles
 * @param {string[]} [options.permissions] - Required permissions
 * @param {string} [options.minProfile] - Minimum profile level
 * 
 * @example
 * authorize({
 *   perfiles: [PROFILES.EMPRESA, PROFILES.MOSTRADOR],
 *   permissions: ['trips:read', 'reservations:write'],
 *   minProfile: PROFILES.MOSTRADOR
 * })
 */
const authorize = ({ perfiles, permissions, minProfile } = {}) => {
  const middlewares = [];
  
  if (perfiles && perfiles.length > 0) {
    middlewares.push(permitirPerfiles(...perfiles));
  }
  
  if (minProfile) {
    middlewares.push(requireMinProfile(minProfile));
  }
  
  if (permissions && permissions.length > 0) {
    permissions.forEach(perm => {
      middlewares.push(requirePermission(perm));
    });
  }
  
  return middlewares;
};

module.exports = {
  autenticarToken,
  permitirPerfiles,
  requirePermission,
  requireOwnership,
  requireMinProfile,
  authorize,
  // Re-export for convenience
  PROFILES,
  hasPermission,
  canAccessResource,
  isAtLeastProfile,
};
