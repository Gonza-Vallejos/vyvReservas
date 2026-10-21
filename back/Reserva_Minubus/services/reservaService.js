const { Reserva, Pasajeros, Viajes, MedioTransporte, Pago, Usuario, Empresa, sequelize } = require("../models");
const { Op } = require("sequelize");
const { NoAvailabilityError, ValidationError, NotFoundError, SeatAlreadyTakenError } = require("../utils/AppError");
const emailService = require("./emailService");

class ReservaService {
  /**
   * Devuelve los números de asiento ya ocupados en un viaje.
   */
  async getNumerosAsientoOcupados(viajes_id, transaction = null) {
    const pasajeros = await Pasajeros.findAll({
      attributes: ["numeroAsiento"],
      where: { eliminado: "no", numeroAsiento: { [Op.not]: null } },
      include: [
        {
          model: Reserva,
          where: { viajes_id, eliminado: "no" },
          attributes: []
        }
      ],
      raw: true,
      transaction
    });
    return pasajeros.map(p => p.numeroAsiento).sort((a, b) => a - b);
  }

  async getAll() {
    return await Reserva.findAll({
      where: { eliminado: "no" },
      include: [Pasajeros]
    });
  }

  async getById(id) {
    return await Reserva.findOne({
      where: { id, eliminado: "no" },
      include: [Pasajeros]
    });
  }

  async getByUsuario(usuarioId) {
    const reservas = await Reserva.findAll({
      where: { usuarios_id: usuarioId, eliminado: "no" },
      attributes: ["id", "fechaReserva", "usuarios_id", "viajes_id"],
      include: [
        {
          model: Pasajeros,
          where: { eliminado: "no" },
          required: false,
        },
        {
          model: Pago,
          where: { eliminado: "no" },
          required: false,
        }
      ]
    });

    const viajesIds = reservas.map((r) => r.viajes_id);
    if (viajesIds.length === 0) return [];

    const viajes = await Viajes.findAll({
      where: { id: viajesIds },
      attributes: ["id", "origenLocalidad", "destinoLocalidad", "horarioSalida", "fechaViaje", "precio", "usuarioEmpresa_id", "medioTransporte_id"],
    });

    return reservas.map((reserva) => {
      const viajeInfo = viajes.find((v) => v.id === reserva.viajes_id);
      const ultimoPago = this.getUltimoPago(reserva.Pagos);
      return {
        id: reserva.id,
        fechaReserva: reserva.fechaReserva,
        usuarios_id: reserva.usuarios_id,
        viajes_id: reserva.viajes_id,
        viaje: viajeInfo,
        Viaje: viajeInfo,
        Pasajeros: reserva.Pasajeros || [],
        pasajeros: reserva.Pasajeros || [],
        Pagos: reserva.Pagos || [],
        pagos: reserva.Pagos || [],
        estadoPago: ultimoPago?.estado || "pendiente",
        estado: ultimoPago?.estado === "aprobado" ? "Pagada" : "Pendiente de pago"
      };
    });
  }

  getUltimoPago(pagos) {
    if (!pagos || pagos.length === 0) return null;
    return pagos.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))[0];
  }

  async getFullReservationDetails(reservaId) {
    return await Reserva.findOne({
      where: { id: reservaId },
      include: [
        { model: Usuario, attributes: ["id", "nombre", "apellido", "email", "telefono", "dni"] },
        {
          model: Viajes,
          include: [
            {
              model: MedioTransporte,
              include: [{ model: Empresa, attributes: ["id", "nombre", "email"] }]
            }
          ]
        },
        { model: Pasajeros }
      ]
    });
  }

  /**
   * Envía confirmaciones por email de forma no bloqueante.
   */
  notifyReservationCreated(reservaId) {
    (async () => {
      try {
        const full = await this.getFullReservationDetails(reservaId);
        if (!full) return;
        const usuario = full.Usuario;
        const viaje = full.Viaje;
        const pasajeros = full.Pasajeros || [];
        const empresa = viaje?.MedioTransporte?.Empresa;

        emailService.sendReservationConfirmation({ reserva: full, usuario, viaje, pasajeros });
        emailService.sendNewReservationNotificationToCompany({ reserva: full, usuario, viaje, pasajeros, empresa });
      } catch (error) {
        // Los emails son fire-and-forget; no deben afectar la respuesta principal.
        console.error("Error enviando notificaciones de reserva:", error.message);
      }
    })();
  }

  /**
   * Envía confirmación de cancelación por email de forma no bloqueante.
   */
  notifyReservationCancelled(reservaId, usuario, viaje, pasajeros) {
    (async () => {
      try {
        let user = usuario;
        let trip = viaje;
        let passengers = pasajeros;

        if (!user || !trip || !passengers) {
          const full = await this.getFullReservationDetails(reservaId);
          if (!full) return;
          user = full.Usuario;
          trip = full.Viaje;
          passengers = full.Pasajeros || [];
        }

        emailService.sendCancellationConfirmation({ reserva: { id: reservaId }, usuario: user, viaje: trip, pasajeros: passengers });
      } catch (error) {
        console.error("Error enviando notificación de cancelación:", error.message);
      }
    })();
  }

  /**
   * Creación atómica de reserva con transacción, control de concurrencia e idempotencia.
   */
  async create(reservaData, pasajerosData = []) {
    const { viajes_id, idempotencyKey } = reservaData;
    const listaPasajeros = (pasajerosData && pasajerosData.length > 0)
      ? pasajerosData
      : (reservaData.personas && reservaData.personas.length > 0 ? reservaData.personas : []);
    const cantPasajerosSolicitados = listaPasajeros.length > 0 ? listaPasajeros.length : 1;

    // Transacción gestionada por Sequelize
    return await sequelize.transaction(async (t) => {
      // Idempotencia: si ya existe una reserva con la misma clave, devolverla
      if (idempotencyKey) {
        const existente = await Reserva.findOne({
          where: { idempotencyKey, eliminado: "no" },
          include: [Pasajeros],
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        if (existente) return existente;
      }

      // Bloqueo de fila para evitar race conditions (FOR UPDATE)
      // Separamos las queries porque PostgreSQL no permite FOR UPDATE en el lado nullable de un LEFT JOIN
      const viaje = await Viajes.findOne({
        where: { id: viajes_id, eliminado: "no" },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!viaje) {
        throw new NotFoundError('Viaje');
      }

      // Obtener el medio de transporte por separado
      const medioTransporte = await MedioTransporte.findOne({
        where: { id: viaje.medioTransporte_id },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!viaje || viaje.cantPasajeros < cantPasajerosSolicitados) {
        throw new NoAvailabilityError('No hay suficientes asientos disponibles');
      }

      // 1. Crear reserva
      const datosParaCrear = {
        usuarios_id: parseInt(reservaData.usuarios_id, 10),
        viajes_id: parseInt(reservaData.viajes_id, 10),
        fechaReserva: reservaData.fechaReserva || new Date(),
        eliminado: "no",
      };
      if (idempotencyKey) {
        datosParaCrear.idempotencyKey = idempotencyKey;
      }
      const nuevaReserva = await Reserva.create(datosParaCrear, { transaction: t });
      nuevaReserva._creadaEnEstaTransaccion = true;

      // 2. Determinar y validar números de asiento de forma atómica
      const totalLugares = medioTransporte?.cantLugares;
      if (!totalLugares) {
        throw new ValidationError('Viaje inválido o sin medio de transporte asignado');
      }

      // Obtener asientos actualmente ocupados dentro de la transacción protegida por el lock
      const ocupados = await this.getNumerosAsientoOcupados(viajes_id, t);

      // Extraer números de asientos solicitados explícitamente por el usuario
      const asientosSolicitados = listaPasajeros
        .map(p => Number(p.numeroAsiento ?? p.seatNumber))
        .filter(n => !isNaN(n) && n > 0);

      const todosTienenAsiento = listaPasajeros.length > 0 && asientosSolicitados.length === listaPasajeros.length;

      let asientosAsignados = [];

      if (todosTienenAsiento) {
        // A. Validar que los asientos estén en el rango físico del vehículo
        const fueraDeRango = asientosSolicitados.filter(n => n < 1 || n > totalLugares);
        if (fueraDeRango.length > 0) {
          throw new ValidationError(`El asiento #${fueraDeRango.join(', #')} no existe en este vehículo (capacidad: ${totalLugares}).`);
        }

        // B. Control de Concurrencia Atómico: Verificar si algún asiento ya fue ocupado
        const enConflicto = asientosSolicitados.filter(n => ocupados.includes(n));
        if (enConflicto.length > 0) {
          const mensaje = enConflicto.length === 1
            ? `El asiento #${enConflicto[0]} acaba de ser reservado por otro usuario. Por favor seleccioná otro lugar disponible.`
            : `Los asientos #${enConflicto.join(', #')} acaban de ser reservados por otro usuario. Por favor seleccioná otros lugares disponibles.`;
          throw new SeatAlreadyTakenError(mensaje, enConflicto);
        }

        asientosAsignados = asientosSolicitados;
      } else {
        // C. Fallback: Si no enviaron asientos específicos, asignar los primeros libres
        const libres = [];
        for (let i = 1; i <= totalLugares && libres.length < cantPasajerosSolicitados; i++) {
          if (!ocupados.includes(i)) libres.push(i);
        }

        if (libres.length < cantPasajerosSolicitados) {
          throw new NoAvailabilityError('No hay suficientes asientos disponibles');
        }
        asientosAsignados = libres;
      }

      // 3. Registrar pasajeros asociados con el número de asiento confirmado
      if (listaPasajeros.length > 0) {
        const pasajerosConReserva = listaPasajeros.map((p, index) => ({
          nombre: p.nombre,
          apellido: p.apellido,
          dni: parseInt(p.dni, 10),
          ubicacionOrigen: p.ubicacionOrigen,
          ubicacionDestino: p.ubicacionDestino,
          reserva_id: nuevaReserva.id,
          numeroAsiento: asientosAsignados[index],
          eliminado: "no"
        }));
        await Pasajeros.bulkCreate(pasajerosConReserva, { transaction: t });
      } else {
        // Reserva sin pasajeros explícitos: crea un pasajero genérico con asiento
        await Pasajeros.create({
          nombre: "Reserva",
          apellido: "Sin especificar",
          dni: 0,
          ubicacionOrigen: "",
          ubicacionDestino: "",
          reserva_id: nuevaReserva.id,
          numeroAsiento: asientosAsignados[0],
          eliminado: "no"
        }, { transaction: t });
      }

      // 4. Decrementar asientos disponibles de forma segura
      await viaje.decrement("cantPasajeros", {
        by: cantPasajerosSolicitados,
        transaction: t
      });

      return nuevaReserva;
    });

    // Notificaciones fire-and-forget fuera de la transacción (solo si se creó realmente)
    if (nuevaReserva._creadaEnEstaTransaccion) {
      this.notifyReservationCreated(nuevaReserva.id);
    }

    return nuevaReserva;
  }

  async update(id, updateData) {
    const [rowsUpdated] = await Reserva.update(updateData, {
      where: { id, eliminado: "no" }
    });
    return rowsUpdated > 0;
  }

  /**
   * Cancelación atómica de reserva con reintegro de asientos
   */
  async delete(id) {
    // Obtener datos completos antes del soft delete para el email de cancelación
    const full = await this.getFullReservationDetails(id);

    const result = await sequelize.transaction(async (t) => {
      const reserva = await Reserva.findOne({
        where: { id, eliminado: "no" },
        transaction: t
      });
      if (!reserva) return false;

      // Soft delete con flag y deleted_at
      await Reserva.update(
        { eliminado: "si", deleted_at: new Date() },
        { where: { id }, transaction: t }
      );

      // Soft delete de los pasajeros
      await Pasajeros.update(
        { eliminado: "si", deleted_at: new Date() },
        { where: { reserva_id: id, eliminado: "no" }, transaction: t }
      );

      // Reintegrar cupos al viaje
      const countPasajeros = await Pasajeros.count({
        where: { reserva_id: id },
        transaction: t
      });

      const cantidadAReinstituir = countPasajeros > 0 ? countPasajeros : 1;
      await Viajes.increment("cantPasajeros", {
        by: cantidadAReinstituir,
        where: { id: reserva.viajes_id },
        transaction: t
      });

      return true;
    });

    if (result && full) {
      this.notifyReservationCancelled(
        id,
        full.Usuario,
        full.Viaje,
        full.Pasajeros || []
      );
    }

    return result;
  }

  /**
   * Eliminación atómica de un pasajero específico con reintegro de 1 asiento
   */
  async deletePasajero(id) {
    return await sequelize.transaction(async (t) => {
      const pasajero = await Pasajeros.findOne({
        where: { id, eliminado: "no" },
        transaction: t
      });
      if (!pasajero) return false;

      const reserva = await Reserva.findByPk(pasajero.reserva_id, { transaction: t });

      await Pasajeros.update(
        { eliminado: "si", deleted_at: new Date() },
        { where: { id }, transaction: t }
      );

      if (reserva) {
        await Viajes.increment("cantPasajeros", {
          by: 1,
          where: { id: reserva.viajes_id },
          transaction: t
        });
      }

      return true;
    });
  }

  async getPasajerosByReserva(reservaId) {
    return await Pasajeros.findAll({ where: { reserva_id: reservaId, eliminado: "no" } });
  }

  async getPasajerosByViaje(viajeId) {
    const reservas = await Reserva.findAll({
      where: { viajes_id: viajeId, eliminado: "no" },
      include: [{ model: Pasajeros, where: { eliminado: "no" } }]
    });
    return reservas.flatMap(r => r.Pasajeros || []);
  }

  async getReservasByEmpresa(empresaId) {
    const viajes = await Viajes.findAll({
      where: { eliminado: "no" },
      include: [{
        model: MedioTransporte,
        where: { empresa_id: empresaId }
      }]
    });

    const viajesIds = viajes.map(v => v.id);
    if (viajesIds.length === 0) return [];

    return await Reserva.findAll({
      where: {
        viajes_id: viajesIds,
        eliminado: "no"
      },
      include: [
        {
          model: Viajes,
          include: [MedioTransporte]
        },
        {
          model: Pasajeros,
          where: { eliminado: "no" },
          required: false
        },
        {
          model: require("../models").Usuario,
          attributes: ["id", "nombre", "apellido", "email", "telefono", "dni"],
          required: false
        }
      ],
      order: [["fechaReserva", "DESC"]]
    });
  }
}

module.exports = new ReservaService();
