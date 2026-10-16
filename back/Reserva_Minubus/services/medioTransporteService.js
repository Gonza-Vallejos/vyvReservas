const { MedioTransporte, Viajes } = require("../models");
const { Op } = require("sequelize");

class MedioTransporteService {
  async getAll() {
    const list = await MedioTransporte.findAll({
      where: { eliminado: "no" },
      attributes: { exclude: ["eliminado"] }
    });
    return list.map(v => v.get({ plain: true }));
  }

  async getById(id) {
    const item = await MedioTransporte.findOne({
      where: { id, eliminado: "no" },
      attributes: { exclude: ["eliminado"] }
    });
    return item ? item.get({ plain: true }) : null;
  }

  async getByEmpresa(empresaId) {
    const list = await MedioTransporte.findAll({
      where: { empresa_id: empresaId, eliminado: "no" },
      attributes: { exclude: ["eliminado"] }
    });
    return list.map(v => v.get({ plain: true }));
  }

  async create(data) {
    return await MedioTransporte.create(data);
  }

  async update(id, data) {
    const { cantLugares } = data;
    const hoy = new Date().toISOString().split("T")[0];

    const [rowsUpdated] = await MedioTransporte.update(data, {
      where: { id, eliminado: "no" }
    });

    if (rowsUpdated > 0 && cantLugares !== undefined) {
      // Actualizar cantPasajeros en los viajes futuros
      await Viajes.update(
        { cantPasajeros: cantLugares },
        {
          where: {
            medioTransporte_id: id,
            fechaViaje: { [Op.gte]: hoy }
          }
        }
      );
    }
    return rowsUpdated > 0;
  }

  async delete(id) {
    const viajesAsociados = await Viajes.findOne({
      where: { medioTransporte_id: id, eliminado: "no" }
    });

    if (viajesAsociados) {
      throw new Error("CANNOT_DELETE_WITH_TRIPS");
    }

    const [rowsUpdated] = await MedioTransporte.update(
      { eliminado: "si" },
      { where: { id } }
    );
    return rowsUpdated > 0;
  }

  async getTrips(id) {
    return await Viajes.findAll({
      where: { medioTransporte_id: id },
      attributes: ["origenLocalidad", "destinoLocalidad", "fechaViaje", "horarioSalida", "medioTransporte_id", "cantPasajeros"]
    });
  }

  async checkNoReservations(id) {
    const ahora = new Date();
    const hoyString = ahora.toISOString().split("T")[0];

    const viajes = await Viajes.findAll({
      where: {
        medioTransporte_id: id,
        fechaViaje: { [Op.gte]: hoyString }
      },
      include: { model: MedioTransporte, attributes: ["cantLugares"] }
    });

    const viajesFuturos = viajes.filter((viaje) => {
      const [h, m, s] = viaje.horarioSalida.split(":").map(Number);
      const fechaHora = new Date(viaje.fechaViaje);
      fechaHora.setHours(h, m, s || 0, 0);
      return fechaHora >= ahora;
    });

    if (viajesFuturos.length === 0) return true;

    return viajesFuturos.every(v => v.cantPasajeros === v.MedioTransporte.cantLugares);
  }
}

module.exports = new MedioTransporteService();
