const authService = require("../services/authService");
const { sendSuccess, sendError } = require("../utils/responseHandler");
const appLogger = require("../utils/logger");
const { setSessionCookie, clearSessionCookie } = require('../utils/sessionCookie');

exports.login = async (req, res) => {
  const { usuario, contrasenia } = req.body;
  try {
    const data = await authService.login(usuario, contrasenia);
    appLogger.info("login_succeeded", {
      requestId: req.requestId,
      userId: data?.usuario?.id,
      perfil: data?.usuario?.perfil_id,
    });
    if (req.get('X-Session-Auth') === 'cookie') {
      setSessionCookie(res, data.token);
      const { token, ...sessionData } = data;
      return sendSuccess(res, sessionData);
    }
    sendSuccess(res, data);
  } catch (error) {
    appLogger.warn("login_failed", {
      requestId: req.requestId,
      usuario,
      reason: error.message,
    });
    if (error.message === "USER_NOT_FOUND" || error.message === "INVALID_PASSWORD") {
      return sendError(res, "Credenciales inválidas", 401);
    }
    sendError(res, "Error en el servidor", 500, error);
  }
};

exports.currentSession = (req, res) => {
  const { id, nombre, apellido, dni, telefono, email, usuario, perfil, perfil_id, empresa_id } = req.usuario;
  return sendSuccess(res, {
    usuario: {
      id,
      nombre,
      apellido,
      dni,
      telefono,
      email,
      usuario,
      perfil,
      perfil_id,
      id_empresa: empresa_id ?? req.usuario.id_empresa ?? null,
    },
  });
};

exports.logout = (req, res) => {
  clearSessionCookie(res);
  return sendSuccess(res, null, 'Sesión cerrada');
};

exports.verificarEmail = async (req, res) => {
  try {
    const { token } = req.params;
    await authService.verifyToken(token);
    // Redirigimos según plataforma (HTML response as before)
    return res.send(`
      <html>
        <head>
          <script>
            const deepLink = 'minibus://login';
            const fallbackWeb = 'https://vyvreservas.expo.app/login';
            if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
              window.location.href = deepLink;
              setTimeout(() => { window.location.href = fallbackWeb; }, 2000);
            } else {
              window.location.href = fallbackWeb;
            }
          </script>
        </head>
        <body><p>Redirigiendo...</p></body>
      </html>
    `);
  } catch (error) {
    sendError(res, "Token inválido o expirado", 400);
  }
};

exports.verificarFinal = async (req, res) => {
  try {
    await authService.verifyToken(req.params.token);
    sendSuccess(res, null, "Cuenta verificada con éxito");
  } catch (error) {
    sendError(res, "Token inválido o expirado", 400);
  }
};

exports.enviarCorreoVerificacion = async (email, token) => {
  await authService.sendVerificationEmail(email, token);
};

exports.solicitarRecuperacion = async (req, res) => {
  try {
    await authService.requestPasswordReset(req.body.email);
    sendSuccess(res, null, "Si el correo está registrado, recibirás un enlace.");
  } catch (error) {
    sendError(res, "Error al procesar la solicitud", 500, error);
  }
};

exports.resetearContrasenia = async (req, res) => {
  try {
    await authService.resetPassword(req.params.token, req.body.nuevaContrasenia);
    sendSuccess(res, null, "Contraseña actualizada correctamente");
  } catch (error) {
    sendError(res, "Token inválido o expirado", 400);
  }
};

exports.abrirApp = (req, res) => {
  const { token } = req.params;
  return res.send(`
    <html>
      <head>
        <script>
          const deepLink = 'minibus://resetear/${token}';
          const fallbackWeb = 'https://vyvreservas.expo.app/resetear/${token}';
          if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = deepLink;
            setTimeout(() => { window.location.href = fallbackWeb; }, 2000);
          } else {
            window.location.href = fallbackWeb;
          }
        </script>
      </head>
      <body><p>Redirigiendo...</p></body>
    </html>
  `);
};
