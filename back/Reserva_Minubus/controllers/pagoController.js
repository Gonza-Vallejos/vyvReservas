const pagoService = require("../services/pagoService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

exports.crearPreferencia = async (req, res) => {
  try {
    const { reserva_id } = req.body;
    const origin = req.get("origin") || req.get("referer");
    let frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl && origin) {
      try {
        frontendUrl = new URL(origin).origin;
      } catch (_) {}
    }
    if (!frontendUrl) frontendUrl = "http://localhost:5173";

    const apiBaseUrl = `${req.protocol}://${req.get("host")}`;
    const resultado = await pagoService.crearPreferencia(reserva_id, apiBaseUrl, frontendUrl);
    sendSuccess(res, resultado, "Preferencia de pago creada", 201);
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    const messages = {
      MP_NOT_CONFIGURED: "Mercado Pago no está configurado",
      RESERVA_NO_ENCONTRADA: "Reserva no encontrada",
      VIAJE_NO_ENCONTRADO: "Viaje no encontrado"
    };
    sendError(res, messages[error.message] || error.message || "Error al crear la preferencia de pago", error.statusCode || 400, error);
  }
};

exports.webhook = async (req, res) => {
  try {
    // Mercado Pago envía IPN por GET y webhooks por POST
    const payload = req.method === 'GET' ? req.query : req.body;
    const { type, topic, data, id } = payload;
    const notificationTopic = topic || type;
    const resourceId = data?.id || id;

    // Responder rápido a Mercado Pago (siempre 200)
    sendSuccess(res, { received: true });

    // Procesar en segundo plano
    if (notificationTopic && resourceId) {
      try {
        await pagoService.procesarWebhook(notificationTopic, resourceId, payload);
      } catch (bgError) {
        console.error("Error procesando notificación en segundo plano:", bgError);
      }
    }
  } catch (error) {
    console.error("Error en webhook:", error);
    sendError(res, "Error al procesar notificación", 500, error);
  }
};

exports.obtenerPagosPorReserva = async (req, res) => {
  try {
    const pagos = await pagoService.obtenerPagosPorReserva(req.params.reservaId);
    sendSuccess(res, pagos);
  } catch (error) {
    sendError(res, "Error al obtener pagos", 500, error);
  }
};

exports.obtenerEstadoPago = async (req, res) => {
  try {
    const estado = await pagoService.obtenerEstadoPago(req.params.reservaId);
    sendSuccess(res, estado);
  } catch (error) {
    console.error("Error al obtener estado de pago:", error);
    const messages = {
      RESERVA_NO_ENCONTRADA: "Reserva no encontrada"
    };
    sendError(res, messages[error.message] || "Error al obtener estado de pago", 400, error);
  }
};

exports.reintentarPago = async (req, res) => {
  try {
    const origin = req.get("origin") || req.get("referer");
    let frontendUrl = process.env.FRONTEND_URL;
    if (!frontendUrl && origin) {
      try {
        frontendUrl = new URL(origin).origin;
      } catch (_) {}
    }
    if (!frontendUrl) frontendUrl = "http://localhost:5173";

    const apiBaseUrl = `${req.protocol}://${req.get("host")}`;
    const resultado = await pagoService.reintentarPago(req.params.reservaId, apiBaseUrl, frontendUrl);
    sendSuccess(res, resultado, "Nueva preferencia de pago creada", 201);
  } catch (error) {
    console.error("Error al reintentar pago:", error);
    const messages = {
      MP_NOT_CONFIGURED: "Mercado Pago no está configurado",
      RESERVA_NO_ENCONTRADA: "Reserva no encontrada",
      PAGO_YA_APROBADO: "La reserva ya tiene un pago aprobado",
      VIAJE_NO_ENCONTRADO: "Viaje no encontrado"
    };
    sendError(res, messages[error.message] || error.message || "Error al reintentar el pago", error.statusCode || 400, error);
  }
};

/**
 * Obtener métricas globales de comisiones y recaudación para el Super Admin
 */
exports.obtenerMetricasComisiones = async (req, res) => {
  try {
    const metricas = await pagoService.obtenerMetricasComisiones();
    sendSuccess(res, metricas, "Métricas de comisiones obtenidas");
  } catch (error) {
    console.error("Error al obtener métricas de comisiones:", error);
    sendError(res, "Error al obtener las métricas de comisiones", 500, error);
  }
};

/**
 * Actualizar el porcentaje de comisión que la plataforma cobra a una empresa
 */
exports.actualizarComisionEmpresa = async (req, res) => {
  try {
    const { comision_porcentaje } = req.body;
    const resultado = await pagoService.actualizarComisionEmpresa(req.params.empresaId, comision_porcentaje);
    sendSuccess(res, resultado, "Comisión de la empresa actualizada correctamente");
  } catch (error) {
    console.error("Error al actualizar comisión de empresa:", error);
    sendError(res, error.message || "Error al actualizar la comisión", error.statusCode || 400, error);
  }
};

/**
 * Obtener la URL de autorización OAuth para que una empresa vincule su cuenta de Mercado Pago
 */
exports.generarUrlOAuth = async (req, res) => {
  try {
    const resultado = pagoService.generarUrlOAuth(req.params.empresaId, req.query.redirect_uri);
    sendSuccess(res, resultado);
  } catch (error) {
    console.error("Error generando URL OAuth:", error);
    sendError(res, "Error al generar la URL de vinculación", 500, error);
  }
};

/**
 * Vincular la cuenta de Mercado Pago de una empresa (por código OAuth o credenciales directas)
 */
exports.vincularMercadoPago = async (req, res) => {
  try {
    const { empresaId } = req.params;
    const { code, accessToken, publicKey, userId, redirectUri } = req.body;

    let resultado;
    if (code) {
      resultado = await pagoService.vincularCuentaEmpresa(empresaId, code, redirectUri);
    } else if (accessToken) {
      resultado = await pagoService.configurarCredencialesEmpresa(empresaId, { accessToken, publicKey, userId });
    } else {
      return sendError(res, "Debes proporcionar un 'code' de autorización OAuth o un 'accessToken'", 400);
    }

    sendSuccess(res, resultado, "Cuenta de Mercado Pago vinculada exitosamente");
  } catch (error) {
    console.error("Error vinculando Mercado Pago:", error);
    sendError(res, error.message || "Error al vincular cuenta de Mercado Pago", error.statusCode || 500, error);
  }
};

/**
 * Desvincular la cuenta de Mercado Pago de una empresa
 */
exports.desvincularMercadoPago = async (req, res) => {
  try {
    const resultado = await pagoService.desvincularEmpresa(req.params.empresaId);
    sendSuccess(res, resultado, "Cuenta de Mercado Pago desvinculada exitosamente");
  } catch (error) {
    console.error("Error desvinculando Mercado Pago:", error);
    sendError(res, error.message || "Error al desvincular cuenta", error.statusCode || 500, error);
  }
};
