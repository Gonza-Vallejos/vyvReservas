const { Reserva, Pasajeros, Viajes, MedioTransporte, sequelize } = require("../models");
const { Op } = require("sequelize");

class ReservaService {
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
      return {
        id: reserva.id,
        fechaReserva: reserva.fechaReserva,
        usuarios_id: reserva.usuarios_id,
        viajes_id: reserva.viajes_id,
        viaje: viajeInfo,
        Viaje: viajeInfo,
        Pasajeros: reserva.Pasajeros || [],
        pasajeros: reserva.Pasajeros || [],
      };
    });
  }

  /**
   * Creación atómica de reserva con transacción y control de concurrencia
   */
  async create(reservaData, pasajerosData = []) {
    const { viajes_id } = reservaData;
    const cantPasajerosSolicitados = pasajerosData && pasajerosData.length > 0 ? pasajerosData.length : 1;

    // Transacción gestionada por Sequelize
    return await sequelize.transaction(async (t) => {
      // Bloqueo de fila para evitar race conditions (FOR UPDATE)
      const viaje = await Viajes.findOne({
        where: { id: viajes_id, eliminado: "no" },
        lock: t.LOCK.UPDATE,
        transaction: t,
      });

      if (!viaje || viaje.cantPasajeros < cantPasajerosSolicitados) {
        throw new Error("NO_AVAILABILITY");
      }

      // 1. Crear reserva
      const datosParaCrear = {
        usuarios_id: parseInt(reservaData.usuarios_id, 10),
        viajes_id: parseInt(reservaData.viajes_id, 10),
        fechaReserva: reservaData.fechaReserva || new Date(),
        eliminado: "no",
      };
      const nuevaReserva = await Reserva.create(datosParaCrear, { transaction: t });

      // 2. Registrar pasajeros asociados
      if (pasajerosData && pasajerosData.length > 0) {
        const pasajerosConReserva = pasajerosData.map(p => ({
          nombre: p.nombre,
          apellido: p.apellido,
          dni: parseInt(p.dni, 10),
          ubicacionOrigen: p.ubicacionOrigen,
          ubicacionDestino: p.ubicacionDestino,
          reserva_id: nuevaReserva.id,
          eliminado: "no"
        }));
        await Pasajeros.bulkCreate(pasajerosConReserva, { transaction: t });
      }

      // 3. Decrementar asientos disponibles de forma segura
      await viaje.decrement("cantPasajeros", {
        by: cantPasajerosSolicitados,
        transaction: t
      });

      return nuevaReserva;
    });
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
    return await sequelize.transaction(async (t) => {
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
    return await Reserva.findAll({
      include: [
        {
          model: Viajes,
          where: { usuarioEmpresa_id: empresaId }
        },
        Pasajeros
      ]
    });
  }
}

module.exports = new ReservaService();
