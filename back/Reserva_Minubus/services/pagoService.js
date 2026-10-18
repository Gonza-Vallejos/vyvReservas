const { MercadoPagoConfig, Preference } = require("mercadopago");
const { Reserva, Pasajeros, Viajes, Pago, WebhookEvent, MedioTransporte, Empresa } = require("../models");
const { NotFoundError, ConflictError, ExternalServiceError, AppError } = require("../utils/AppError");

const getClient = () => {
  const mpAccessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  if (!mpAccessToken || mpAccessToken.trim() === '' || mpAccessToken.includes('0000000000000000')) {
    return null;
  }
  return new MercadoPagoConfig({ accessToken: mpAccessToken.trim() });
};

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
   * Crea una preferencia de pago en Mercado Pago para una reserva con soporte Marketplace Split.
   * Si la empresa tiene cuenta de MP vinculada, usa su token y aplica marketplace_fee para el Super Admin.
   * Si no, usa las credenciales generales o modo simulación registrando el desglose de comisiones.
   */
  async crearPreferencia(reservaId, apiBaseUrl, frontendUrl = null) {
    const defaultClient = getClient();
    const effectiveFrontendUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';

    const reserva = await Reserva.findOne({
      where: { id: reservaId, eliminado: "no" },
      include: [
        {
          model: Viajes,
          include: [
            {
              model: MedioTransporte,
              include: [{ model: Empresa }]
            }
          ]
        },
        { model: Pasajeros, where: { eliminado: "no" } }
      ]
    });

    if (!reserva) throw new NotFoundError('Reserva');
    if (!reserva.Viaje) throw new NotFoundError('Viaje asociado a la reserva');

    const pasajeros = reserva.Pasajeros || [];
    const cantidad = pasajeros.length || 1;
    const monto = Number(reserva.Viaje.precio) * cantidad;

    // Obtener la empresa proveedora del viaje y calcular su comisión
    const empresa = reserva.Viaje?.MedioTransporte?.Empresa;
    const empresaId = empresa?.id || null;
    const porcentajeComision = Number(empresa?.comision_porcentaje ?? process.env.DEFAULT_PLATFORM_COMMISSION_PERCENT ?? 10);
    const montoComision = Math.round((monto * (porcentajeComision / 100)) * 100) / 100;
    const montoEmpresa = Math.round((monto - montoComision) * 100) / 100;

    // Determinar si la empresa tiene su propio token de Mercado Pago (Marketplace OAuth)
    let effectiveClient = null;
    let isMarketplaceSplit = false;

    if (empresa?.mp_access_token && empresa.mp_access_token.trim() !== '' && !empresa.mp_access_token.includes('0000000000000000')) {
      effectiveClient = new MercadoPagoConfig({ accessToken: empresa.mp_access_token.trim() });
      isMarketplaceSplit = true;
    } else {
      effectiveClient = defaultClient;
    }

    // Si no hay credenciales de Mercado Pago configuradas, permitir modo simulación en desarrollo/demo
    if (!effectiveClient) {
      const allowMock = process.env.ALLOW_MOCK_PAYMENTS !== 'false';
      if (allowMock) {
        const externalReference = `MOCK-RESERVA-${reservaId}-${Date.now()}`;
        const nuevoPago = await Pago.create({
          reserva_id: reservaId,
          empresa_id: empresaId,
          monto,
          monto_comision: montoComision,
          monto_empresa: montoEmpresa,
          porcentaje_comision: porcentajeComision,
          estado: "aprobado",
          mp_preference_id: `mock-pref-${Date.now()}`,
          mp_external_reference: externalReference,
          mp_init_point: `${effectiveFrontendUrl}/pagos/exitoso?mock=true&reserva_id=${reservaId}`,
          fechaCreacion: new Date(),
          fechaActualizacion: new Date()
        });
        return {
          pagoId: nuevoPago.id,
          initPoint: `${effectiveFrontendUrl}/pagos/exitoso?mock=true&reserva_id=${reservaId}`,
          sandboxInitPoint: `${effectiveFrontendUrl}/pagos/exitoso?mock=true&reserva_id=${reservaId}`,
          externalReference,
          monto,
          montoComision,
          montoEmpresa,
          porcentajeComision,
          empresaId,
          isMock: true
        };
      }
      throw new AppError('Mercado Pago no está configurado. Por favor define MERCADO_PAGO_ACCESS_TOKEN.', 500, 'MP_NOT_CONFIGURED');
    }

    if (!canMakeRequest()) {
      throw new ExternalServiceError('Mercado Pago no disponible, intente más tarde');
    }

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
        montoComision: preferenciaExistente.monto_comision,
        montoEmpresa: preferenciaExistente.monto_empresa,
        reused: true
      };
    }

    const externalReference = `RESERVA-${reservaId}-${Date.now()}`;

    try {
      const preferenceBody = {
        items: [
          {
            id: `viaje-${reserva.Viaje.id}`,
            title: `Pasaje ${reserva.Viaje.origenLocalidad} → ${reserva.Viaje.destinoLocalidad}`,
            description: `Reserva #${reservaId} (${empresa?.nombre || 'V&V Express'})`,
            quantity: cantidad,
            unit_price: Number(reserva.Viaje.precio),
            currency_id: "ARS"
          }
        ],
        external_reference: externalReference,
        back_urls: {
          success: `${effectiveFrontendUrl}/pagos/exitoso`,
          failure: `${effectiveFrontendUrl}/pagos/fallido`,
          pending: `${effectiveFrontendUrl}/pagos/exitoso`
        },
        auto_return: "approved",
        notification_url: `${apiBaseUrl}/api/pagos/webhook`
      };

      // Si la empresa tiene vinculada su cuenta (Marketplace Split),
      // MP retiene marketplace_fee automáticamente y lo transfiere a la cuenta del Super Admin
      if (isMarketplaceSplit && montoComision > 0) {
        preferenceBody.marketplace_fee = montoComision;
      }

      const preference = new Preference(effectiveClient);
      const response = await withRetry(() => preference.create({ body: preferenceBody }), 3, 1000);

      circuitSuccess();

      const nuevoPago = await Pago.create({
        reserva_id: reservaId,
        empresa_id: empresaId,
        monto,
        monto_comision: montoComision,
        monto_empresa: montoEmpresa,
        porcentaje_comision: porcentajeComision,
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
        monto,
        montoComision,
        montoEmpresa,
        porcentajeComision,
        isMarketplaceSplit
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
    const client = getClient();
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

  async reintentarPago(reservaId, apiBaseUrl, frontendUrl = null) {
    const estado = await this.obtenerEstadoPago(reservaId);
    if (estado.pagado) throw new ConflictError('La reserva ya tiene un pago aprobado');
    return await this.crearPreferencia(reservaId, apiBaseUrl, frontendUrl);
  }

  /**
   * Obtiene las métricas globales de comisiones y facturación para el Super Admin
   */
  async obtenerMetricasComisiones() {
    const pagosAprobados = await Pago.findAll({
      where: { estado: 'aprobado', eliminado: 'no' },
      include: [
        {
          model: Empresa,
          attributes: ['id', 'nombre', 'cuit', 'email', 'comision_porcentaje', 'mp_vinculado', 'mp_user_id']
        },
        {
          model: Reserva,
          attributes: ['id', 'fechaReserva'],
          include: [
            {
              model: Viajes,
              attributes: ['id', 'origenLocalidad', 'destinoLocalidad', 'fechaViaje']
            }
          ]
        }
      ],
      order: [['fechaCreacion', 'DESC']]
    });

    let totalRecaudado = 0;
    let totalComisionesPlataforma = 0;
    let totalNetoEmpresas = 0;

    const todasLasEmpresas = await Empresa.findAll({
      where: { eliminado: 'no' },
      attributes: ['id', 'nombre', 'cuit', 'email', 'comision_porcentaje', 'mp_vinculado', 'mp_user_id']
    });

    const empresasMap = {};
    for (const emp of todasLasEmpresas) {
      empresasMap[emp.id] = {
        empresaId: emp.id,
        nombre: emp.nombre,
        cuit: emp.cuit,
        email: emp.email,
        comisionPorcentaje: Number(emp.comision_porcentaje || 10),
        mpVinculado: Boolean(emp.mp_vinculado),
        mpUserId: emp.mp_user_id || null,
        cantidadVentas: 0,
        totalRecaudado: 0,
        totalComision: 0,
        totalNeto: 0
      };
    }

    for (const pago of pagosAprobados) {
      const monto = Number(pago.monto || 0);
      const porcentaje = Number(pago.porcentaje_comision || 10);
      const comision = Number(pago.monto_comision > 0 ? pago.monto_comision : Math.round((monto * (porcentaje / 100)) * 100) / 100);
      const neto = Number(pago.monto_empresa > 0 ? pago.monto_empresa : Math.round((monto - comision) * 100) / 100);

      totalRecaudado += monto;
      totalComisionesPlataforma += comision;
      totalNetoEmpresas += neto;

      const empId = pago.empresa_id || pago.Empresa?.id;
      if (empId && empresasMap[empId]) {
        empresasMap[empId].cantidadVentas += 1;
        empresasMap[empId].totalRecaudado += monto;
        empresasMap[empId].totalComision += comision;
        empresasMap[empId].totalNeto += neto;
      }
    }

    // Redondear totales
    for (const id in empresasMap) {
      empresasMap[id].totalRecaudado = Math.round(empresasMap[id].totalRecaudado * 100) / 100;
      empresasMap[id].totalComision = Math.round(empresasMap[id].totalComision * 100) / 100;
      empresasMap[id].totalNeto = Math.round(empresasMap[id].totalNeto * 100) / 100;
    }

    return {
      resumen: {
        totalVentas: pagosAprobados.length,
        totalRecaudado: Math.round(totalRecaudado * 100) / 100,
        totalComisionesPlataforma: Math.round(totalComisionesPlataforma * 100) / 100,
        totalNetoEmpresas: Math.round(totalNetoEmpresas * 100) / 100,
        comisionPromedioPorcentaje: totalRecaudado > 0 
          ? Math.round((totalComisionesPlataforma / totalRecaudado) * 1000) / 10 
          : Number(process.env.DEFAULT_PLATFORM_COMMISSION_PERCENT || 10)
      },
      empresas: Object.values(empresasMap),
      ultimasTransacciones: pagosAprobados.slice(0, 20).map(p => ({
        pagoId: p.id,
        reservaId: p.reserva_id,
        fecha: p.fechaCreacion,
        montoTotal: p.monto,
        comisionPlataforma: p.monto_comision,
        netoEmpresa: p.monto_empresa,
        porcentajeComision: p.porcentaje_comision,
        empresa: p.Empresa ? { id: p.Empresa.id, nombre: p.Empresa.nombre } : null,
        viaje: p.Reserva?.Viaje ? `${p.Reserva.Viaje.origenLocalidad} → ${p.Reserva.Viaje.destinoLocalidad}` : null
      }))
    };
  }

  /**
   * Actualiza el porcentaje de comisión para una empresa (Solo Super Admin)
   */
  async actualizarComisionEmpresa(empresaId, comisionPorcentaje) {
    const num = Number(comisionPorcentaje);
    if (isNaN(num) || num < 0 || num > 100) {
      throw new AppError('El porcentaje de comisión debe estar entre 0 y 100', 400);
    }
    const [actualizado] = await Empresa.update(
      { comision_porcentaje: num },
      { where: { id: empresaId, eliminado: 'no' } }
    );
    if (!actualizado) throw new NotFoundError('Empresa');
    return { empresaId, comisionPorcentaje: num };
  }

  /**
   * Genera el enlace de autorización OAuth para que la empresa vincule su cuenta de Mercado Pago
   */
  generarUrlOAuth(empresaId, redirectUri = null) {
    const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
    const effectiveRedirectUri = redirectUri || process.env.MERCADO_PAGO_REDIRECT_URI || `${process.env.BASE_URL || 'http://localhost:3000'}/api/pagos/oauth/callback`;
    
    if (!clientId) {
      return {
        configured: false,
        message: "Para habilitar la vinculación automática OAuth, define MERCADO_PAGO_CLIENT_ID y MERCADO_PAGO_CLIENT_SECRET en las variables de entorno.",
        urlManualConfig: true
      };
    }

    const authUrl = `https://auth.mercadopago.com.ar/authorization?client_id=${clientId}&response_type=code&platform_id=mp&state=${empresaId}&redirect_uri=${encodeURIComponent(effectiveRedirectUri)}`;
    return {
      configured: true,
      url: authUrl,
      clientId,
      redirectUri: effectiveRedirectUri
    };
  }

  /**
   * Vincula la cuenta de Mercado Pago de una empresa procesando el código devuelto por OAuth
   */
  async vincularCuentaEmpresa(empresaId, code, redirectUri = null) {
    const clientId = process.env.MERCADO_PAGO_CLIENT_ID;
    const clientSecret = process.env.MERCADO_PAGO_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      throw new AppError("Variables MERCADO_PAGO_CLIENT_ID y MERCADO_PAGO_CLIENT_SECRET no configuradas", 500, "MP_CONFIG_MISSING");
    }

    const effectiveRedirectUri = redirectUri || process.env.MERCADO_PAGO_REDIRECT_URI || `${process.env.BASE_URL || 'http://localhost:3000'}/api/pagos/oauth/callback`;

    const response = await fetch("https://api.mercadopago.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_secret: clientSecret,
        client_id: clientId,
        grant_type: "authorization_code",
        code,
        redirect_uri: effectiveRedirectUri
      })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new ExternalServiceError(`Error en autorización con Mercado Pago: ${data.message || JSON.stringify(data)}`);
    }

    await Empresa.update({
      mp_access_token: data.access_token,
      mp_public_key: data.public_key,
      mp_refresh_token: data.refresh_token,
      mp_user_id: String(data.user_id),
      mp_vinculado: true
    }, { where: { id: empresaId } });

    return {
      empresaId,
      userId: data.user_id,
      vinculado: true
    };
  }

  /**
   * Permite configurar o actualizar manualmente las credenciales de MP de una empresa (para desarrollo/pruebas)
   */
  async configurarCredencialesEmpresa(empresaId, { accessToken, publicKey, userId }) {
    const empresa = await Empresa.findByPk(empresaId);
    if (!empresa) throw new NotFoundError('Empresa');

    await Empresa.update({
      mp_access_token: accessToken || null,
      mp_public_key: publicKey || null,
      mp_user_id: userId || null,
      mp_vinculado: Boolean(accessToken && accessToken.trim())
    }, { where: { id: empresaId } });

    return { empresaId, vinculado: Boolean(accessToken && accessToken.trim()) };
  }

  /**
   * Desvincula la cuenta de Mercado Pago de una empresa
   */
  async desvincularEmpresa(empresaId) {
    const empresa = await Empresa.findByPk(empresaId);
    if (!empresa) throw new NotFoundError('Empresa');

    await Empresa.update({
      mp_access_token: null,
      mp_public_key: null,
      mp_refresh_token: null,
      mp_user_id: null,
      mp_vinculado: false
    }, { where: { id: empresaId } });

    return { empresaId, desvinculado: true };
  }
}

module.exports = new PagoService();
