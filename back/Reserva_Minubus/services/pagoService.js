const { MercadoPagoConfig, Preference } = require("mercadopago");
const { Reserva, Pasajeros, Viajes, Pago, WebhookEvent } = require("../models");
const { NotFoundError, ConflictError, ExternalServiceError, AppError } = require("../utils/AppError");

const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
const client = mpAccessToken ? new MercadoPagoConfig({ accessToken: mpAccessToken }) : null;

// Circuit breaker state
const circuitState = {
  failures: 0,
  lastFailure: null,
  state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
  threshold: 5,
  timeout: 30000, // 30 seconds
};

/**
 * Reset circuit breaker after successful call
 */
const circuitSuccess = () => {
  circuitState.failures = 0;
  circuitState.state = 'CLOSED';
};

/**
 * Record failure and potentially open circuit
 */
const circuitFailure = () => {
  circuitState.failures++;
  circuitState.lastFailure = Date.now();
  
  if (circuitState.failures >= circuitState.threshold) {
    circuitState.state = 'OPEN';
    console.warn('Circuit breaker OPEN - Mercado Pago unavailable');
  }
};

/**
 * Check if circuit allows request
 */
const canMakeRequest = () => {
  if (circuitState.state === 'CLOSED') return true;
  
  if (circuitState.state === 'OPEN') {
    const timeSinceFailure = Date.now() - circuitState.lastFailure;
    if (timeSinceFailure > circuitState.timeout) {
      circuitState.state = 'HALF_OPEN';
      return true;
    }
    return false;
  }
  
  return true; // HALF_OPEN allows request
};

/**
 * Retry wrapper with exponential backoff
 */
const withRetry = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`MP request failed (attempt ${attempt}/${maxRetries}):`, error.message);
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

class PagoService {
  /**
   * Crea una preferencia de pago en Mercado Pago para una reserva.
   * Si ya existe una preferencia pendiente reciente, la reutiliza.
   */
  async crearPreferencia(reservaId, baseUrl) {
    if (!client) {
      throw new AppError('Mercado Pago no está configurado', 500, 'MP_NOT_CONFIGURED');
    }

    if (!canMakeRequest()) {
      throw new ExternalServiceError('Mercado Pago no disponible, intente más tarde');
    }

    const reserva = await Reserva.findOne({
      where: { id: reservaId, eliminado: "no" },
      include: [
        { model: Viajes },
        { model: Pasajeros, where: { eliminado: "no" } }
      ]
    });

    if (!reserva) throw new NotFoundError('Reserva');
    if (!reserva.Viaje) throw new NotFoundError('Viaje asociado a la reserva');

    const pasajeros = reserva.Pasajeros || [];
    const cantidad = pasajeros.length || 1;
    const monto = reserva.Viaje.precio * cantidad;

    // Reutilizar preferencia pendiente reciente (idempotencia)
    const preferenciaExistente = await Pago.findOne({
      where: {
        reserva_id: reservaId,
        estado: "pendiente",
        mp_init_point: { [require("sequelize").Op.ne]: null }
      },
      order: [["fechaCreacion", "DESC"]]
    });

    if (preferenciaExistente) {
      circuitSuccess();
      return {
        pagoId: preferenciaExistente.id,
        initPoint: preferenciaExistente.mp_init_point,
        sandboxInitPoint: preferenciaExistente.mp_init_point,
        externalReference: preferenciaExistente.mp_external_reference,
        monto: preferenciaExistente.monto,
        reused: true
      };
    }

    const externalReference = `RESERVA-${reservaId}-${Date.now()}`;

    try {
      const preference = new Preference(client);
      const response = await withRetry(() => preference.create({
        body: {
          items: [
            {
              id: `viaje-${reserva.Viaje.id}`,
              title: `Pasaje ${reserva.Viaje.origenLocalidad} → ${reserva.Viaje.destinoLocalidad}`,
              description: `Reserva #${reservaId}`,
              quantity: cantidad,
              unit_price: reserva.Viaje.precio,
              currency_id: "ARS"
            }
          ],
          external_reference: externalReference,
          back_urls: {
            success: `${baseUrl}/pagos/exitoso`,
            failure: `${baseUrl}/pagos/fallido`,
            pending: `${baseUrl}/pagos/pendiente`
          },
          auto_return: "approved",
          notification_url: `${baseUrl}/api/pagos/webhook`
        }
      }), 3, 1000);

      circuitSuccess();

      const nuevoPago = await Pago.create({
        reserva_id: reservaId,
        monto,
        estado: "pendiente",
        mp_preference_id: response.id,
        mp_external_reference: externalReference,
        mp_init_point: response.init_point,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date()
      });

      return {
        pagoId: nuevoPago.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
        externalReference,
        monto
      };
    } catch (error) {
      circuitFailure();
      console.error('Error creando preferencia MP:', error.message);
      throw new ExternalServiceError('Mercado Pago');
    }
  }

  /**
   * Procesa la notificación (webhook/IPN) de Mercado Pago con idempotencia.
   * Si el evento ya fue procesado, se ignora.
   */
  async procesarWebhook(topic, resourceId, rawPayload = null) {
    if (!client) throw new AppError('Mercado Pago no está configurado', 500, 'MP_NOT_CONFIGURED');

    const eventKey = `${topic}-${resourceId}`;

    // Idempotencia: guardar evento con clave única; si ya existe, ignorar
    const [evento, creado] = await WebhookEvent.findOrCreate({
      where: { topic, resourceId },
      defaults: {
        topic,
        resourceId,
        payload: rawPayload,
        processedAt: null
      }
    });

    if (!creado && evento.processedAt) {
      return { message: "Evento ya procesado", eventId: evento.id };
    }

    let resultado = { message: "Notificación ignorada" };

    // Para topic 'payment', resourceId es el payment id.
    if (topic === "payment") {
      try {
        const { Payment } = require("mercadopago");
        const payment = new Payment(client);
        
        const paymentData = await withRetry(() => payment.get({ id: resourceId }), 3, 1000);
        circuitSuccess();

        const externalReference = paymentData.external_reference;
        const estado = paymentData.status;

        const pago = await Pago.findOne({
          where: { mp_external_reference: externalReference, eliminado: "no" }
        });

        if (!pago) throw new NotFoundError('Pago');

        // Idempotencia por payment_id: si ya está aprobado con este payment_id, no actualizar
        if (pago.mp_payment_id === String(resourceId) && pago.estado === "aprobado") {
          await evento.update({ processedAt: new Date() });
          return { pagoId: pago.id, estado: pago.estado, message: "Pago ya aprobado" };
        }

        const nuevoEstado = this.mapearEstadoMP(estado);
        await Pago.update(
          {
            estado: nuevoEstado,
            mp_payment_id: String(resourceId),
            fechaActualizacion: new Date()
          },
          { where: { id: pago.id } }
        );

        resultado = { pagoId: pago.id, estado: nuevoEstado };
      } catch (error) {
        circuitFailure();
        console.error('Error procesando webhook MP:', error.message);
        throw new ExternalServiceError('Mercado Pago');
      }
    }

    await evento.update({ processedAt: new Date() });
    return resultado;
  }

  mapearEstadoMP(estadoMP) {
    switch (estadoMP) {
      case "approved":
        return "aprobado";
      case "pending":
      case "in_process":
        return "pendiente";
      case "rejected":
        return "rechazado";
      case "cancelled":
        return "cancelado";
      default:
        return "pendiente";
    }
  }

  async obtenerPagosPorReserva(reservaId) {
    return await Pago.findAll({
      where: { reserva_id: reservaId, eliminado: "no" },
      order: [["fechaCreacion", "DESC"]]
    });
  }

  async obtenerEstadoPago(reservaId) {
    const reserva = await Reserva.findOne({
      where: { id: reservaId, eliminado: "no" },
      include: [Viajes]
    });
    if (!reserva) throw new NotFoundError('Reserva');

    const pasajeros = await Pasajeros.findAll({
      where: { reserva_id: reservaId, eliminado: "no" }
    });

    const cantidad = pasajeros.length || 1;
    const total = reserva.Viaje?.precio * cantidad || 0;

    const pagos = await Pago.findAll({
      where: { reserva_id: reservaId, eliminado: "no" },
      order: [["fechaCreacion", "DESC"]]
    });

    const ultimoPago = pagos[0];
    const estado = ultimoPago?.estado || "pendiente";

    return {
      reservaId: Number(reservaId),
      total,
      estado,
      pagado: estado === "aprobado",
      ultimoPago: ultimoPago || null,
      historial: pagos
    };
  }

  async reintentarPago(reservaId, baseUrl) {
    const estado = await this.obtenerEstadoPago(reservaId);
    if (estado.pagado) throw new ConflictError('La reserva ya tiene un pago aprobado');
    return await this.crearPreferencia(reservaId, baseUrl);
  }
}

module.exports = new PagoService();
