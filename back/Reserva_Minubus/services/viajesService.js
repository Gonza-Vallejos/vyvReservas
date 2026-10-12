const { Viajes, MedioTransporte, UsuarioEmpresa, Usuario, Reserva, Empresa } = require("../models");
const { Op } = require("sequelize");

class ViajesService {
  async getAll() {
    return await Viajes.findAll({
      where: { eliminado: "no" },
      include: [MedioTransporte]
    });
  }

  async getById(id) {
    return await Viajes.findOne({
      where: { id, eliminado: "no" },
      include: [MedioTransporte]
    });
  }

  async getAvailable(origen, destino, fecha) {
    const ahora = new Date();
    const hoyStr = ahora.toISOString().split("T")[0];

    const where = {
      eliminado: "no",
      cantPasajeros: { [Op.gt]: 0 }
    };

    if (fecha) {
      // Filtrar por la fecha exacta seleccionada
      where.fechaViaje = fecha;
    } else {
      // Por defecto desde hoy en adelante
      where.fechaViaje = { [Op.gte]: hoyStr };
    }

    if (origen) {
      where.origenLocalidad = { [Op.iLike || Op.like]: `%${origen}%` };
    }
    if (destino) {
      where.destinoLocalidad = { [Op.iLike || Op.like]: `%${destino}%` };
    }

    return await Viajes.findAll({
      where,
      order: [['fechaViaje', 'ASC'], ['horarioSalida', 'ASC']],
      include: [
        {
          model: MedioTransporte,
          include: [{ model: Empresa, attributes: ['nombre', 'email'] }]
        }
      ]
    });
  }

  async create(viajeData) {
    const { medioTransporte_id, usuarioEmpresa_id } = viajeData;

    const transporte = await MedioTransporte.findByPk(medioTransporte_id);
    if (!transporte) throw new Error("INVALID_TRANSPORTE");

    const usuarioEmpresa = await UsuarioEmpresa.findOne({
      where: { id: usuarioEmpresa_id },
      include: [{ model: Usuario, where: { perfil_id: 4 } }]
    });
    if (!usuarioEmpresa) throw new Error("INVALID_CHOFER");

    if (usuarioEmpresa.id_empresa !== transporte.empresa_id) {
      throw new Error("EMPRESA_MISMATCH");
    }

    return await Viajes.create({
      ...viajeData,
      cantPasajeros: transporte.cantLugares
    });
  }

  async update(id, updateData) {
    const [rowsUpdated] = await Viajes.update(updateData, {
      where: { id, eliminado: "no" }
    });
    return rowsUpdated > 0;
  }

  async delete(id) {
    const viaje = await Viajes.findByPk(id);
    if (!viaje) return false;

    const hoy = new Date();
    if (new Date(viaje.fechaViaje) < hoy) {
      throw new Error("TRIP_ALREADY_HAPPENED");
    }

    const reserva = await Reserva.findOne({ where: { viajes_id: id, eliminado: "no" } });
    if (reserva) throw new Error("HAS_RESERVATIONS");

    const [rowsUpdated] = await Viajes.update({ eliminado: "si" }, { where: { id } });
    return rowsUpdated > 0;
  }

  async getByEmpresa(empresaId) {
    return await Viajes.findAll({
      where: { eliminado: "no" },
      include: [
        {
          model: MedioTransporte,
          where: { empresa_id: empresaId }
        }
      ]
    });
  }

  async getByChofer(usuarioEmpresaId) {
    return await Viajes.findAll({
      where: { usuarioEmpresa_id: usuarioEmpresaId, eliminado: "no" },
      include: [MedioTransporte]
    });
  }

  async hasReservations(id) {
    const reserva = await Reserva.findOne({ where: { viajes_id: id } });
    return !!reserva;
  }
}

module.exports = new ViajesService();
