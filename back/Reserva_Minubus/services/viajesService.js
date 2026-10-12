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

    const horarioNormalizado = (viajeData.horarioSalida && viajeData.horarioSalida.length === 5)
      ? `${viajeData.horarioSalida}:00`
      : viajeData.horarioSalida;

    return await Viajes.create({
      ...viajeData,
      horarioSalida: horarioNormalizado,
      cantPasajeros: transporte.cantLugares
    });
  }

  async update(id, updateData) {
    const dataToUpdate = { ...updateData };
    if (dataToUpdate.horarioSalida && dataToUpdate.horarioSalida.length === 5) {
      dataToUpdate.horarioSalida = `${dataToUpdate.horarioSalida}:00`;
    }
    const [rowsUpdated] = await Viajes.update(dataToUpdate, {
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

  async getByChofer(id) {
    // Buscar si el id provisto es de usuario o de usuarioEmpresa
    const asoc = await UsuarioEmpresa.findOne({
      where: {
        [Op.or]: [{ id: id }, { id_usuario: id }]
      }
    });

    const whereClause = { eliminado: "no" };
    if (asoc) {
      whereClause.usuarioEmpresa_id = asoc.id;
    } else {
      whereClause.usuarioEmpresa_id = id;
    }

    return await Viajes.findAll({
      where: whereClause,
      include: [
        {
          model: MedioTransporte,
          include: [{ model: Empresa, attributes: ['nombre', 'telefono'] }]
        },
        {
          model: Reserva,
          where: { eliminado: "no" },
          required: false,
          include: [{ model: Pasajeros, where: { eliminado: "no" }, required: false }]
        }
      ],
      order: [["fechaViaje", "ASC"], ["horarioSalida", "ASC"]]
    });
  }

  async hasReservations(id) {
    const reserva = await Reserva.findOne({ where: { viajes_id: id } });
    return !!reserva;
  }
}

module.exports = new ViajesService();
