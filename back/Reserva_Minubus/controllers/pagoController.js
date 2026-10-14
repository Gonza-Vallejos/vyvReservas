const pagoService = require("../services/pagoService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

exports.crearPreferencia = async (req, res) => {
  try {
    const { reserva_id } = req.body;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const resultado = await pagoService.crearPreferencia(reserva_id, baseUrl);
    sendSuccess(res, resultado, "Preferencia de pago creada", 201);
  } catch (error) {
    console.error("Error al crear preferencia:", error);
    const messages = {
      MP_NOT_CONFIGURED: "Mercado Pago no está configurado",
      RESERVA_NO_ENCONTRADA: "Reserva no encontrada",
      VIAJE_NO_ENCONTRADO: "Viaje no encontrado"
    };
    sendError(res, messages[error.message] || "Error al crear la preferencia de pago", 400, error);
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
        await pagoService.procesarWebhook(notificationTopic, resourceId);
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
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const resultado = await pagoService.reintentarPago(req.params.reservaId, baseUrl);
    sendSuccess(res, resultado, "Nueva preferencia de pago creada", 201);
  } catch (error) {
    console.error("Error al reintentar pago:", error);
    const messages = {
      MP_NOT_CONFIGURED: "Mercado Pago no está configurado",
      RESERVA_NO_ENCONTRADA: "Reserva no encontrada",
      PAGO_YA_APROBADO: "La reserva ya tiene un pago aprobado",
      VIAJE_NO_ENCONTRADO: "Viaje no encontrado"
    };
    sendError(res, messages[error.message] || "Error al reintentar el pago", 400, error);
  }
};
