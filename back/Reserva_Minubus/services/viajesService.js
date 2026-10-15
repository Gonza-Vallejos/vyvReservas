const { Viajes, MedioTransporte, UsuarioEmpresa, Usuario, Reserva, Empresa, Pasajeros } = require("../models");
const { Op } = require("sequelize");
const appLogger = require("../utils/logger");

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

    const viajes = await Viajes.findAll({
      where,
      order: [['fechaViaje', 'ASC'], ['horarioSalida', 'ASC']],
      include: [
        {
          model: MedioTransporte,
          include: [{ model: Empresa, attributes: ['nombre', 'email'] }]
        }
      ]
    });
    
    // Convert to plain objects to avoid circular references
    return viajes.map(v => v.get({ plain: true }));
  }

  async create(viajeData) {
    const { medioTransporte_id, usuarioEmpresa_id } = viajeData;

    const transporte = await MedioTransporte.findByPk(medioTransporte_id);
    if (!transporte) {
      appLogger.warn("trip_validation_failed", {
        reason: "INVALID_TRANSPORTE",
        medioTransporteId: medioTransporte_id,
      });
      throw new Error("INVALID_TRANSPORTE");
    }

    // El frontend debe enviar el ID de la asociación UsuarioEmpresa, no el
    // ID del usuario. La validación del perfil se hace en la consulta para no
    // depender de datos enviados por el cliente.
    const usuarioEmpresa = await UsuarioEmpresa.findOne({
      where: { id: Number(usuarioEmpresa_id) },
      include: [{ model: Usuario, where: { perfil_id: 4, eliminado: "no" } }]
    });
    if (!usuarioEmpresa) {
      appLogger.warn("trip_validation_failed", {
        reason: "INVALID_CHOFER",
        usuarioEmpresaId: usuarioEmpresa_id,
      });
      throw new Error("INVALID_CHOFER");
    }

    if (usuarioEmpresa.id_empresa !== transporte.empresa_id) {
      appLogger.warn("trip_validation_failed", {
        reason: "EMPRESA_MISMATCH",
        usuarioEmpresaId: usuarioEmpresa_id,
        transporteEmpresaId: transporte.empresa_id,
        choferEmpresaId: usuarioEmpresa.id_empresa,
      });
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

    if (dataToUpdate.usuarioEmpresa_id || dataToUpdate.medioTransporte_id) {
      const viaje = await Viajes.findByPk(id);
      if (!viaje) return false;

      const transporteId = dataToUpdate.medioTransporte_id || viaje.medioTransporte_id;
      const choferAssociationId = dataToUpdate.usuarioEmpresa_id || viaje.usuarioEmpresa_id;
      const transporte = await MedioTransporte.findByPk(transporteId);
      const usuarioEmpresa = await UsuarioEmpresa.findOne({
        where: { id: Number(choferAssociationId) },
        include: [{ model: Usuario, where: { perfil_id: 4, eliminado: "no" } }]
      });

       if (!transporte) {
         appLogger.warn("trip_update_validation_failed", {
           reason: "INVALID_TRANSPORTE",
           viajeId: id,
           medioTransporteId: transporteId,
         });
         throw new Error("INVALID_TRANSPORTE");
       }
       if (!usuarioEmpresa) {
         appLogger.warn("trip_update_validation_failed", {
           reason: "INVALID_CHOFER",
           viajeId: id,
           usuarioEmpresaId: choferAssociationId,
         });
         throw new Error("INVALID_CHOFER");
       }
       if (usuarioEmpresa.id_empresa !== transporte.empresa_id) {
         appLogger.warn("trip_update_validation_failed", {
           reason: "EMPRESA_MISMATCH",
           viajeId: id,
           usuarioEmpresaId: choferAssociationId,
           transporteEmpresaId: transporte.empresa_id,
           choferEmpresaId: usuarioEmpresa.id_empresa,
         });
         throw new Error("EMPRESA_MISMATCH");
      }
    }

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

  /**
   * Devuelve el mapa de asientos de un viaje: total, ocupados, libres y detalle por número.
   */
  async getAsientosOcupados(id, esStaff = false) {
    const viaje = await Viajes.findOne({
      where: { id, eliminado: "no" },
      include: [{
        model: MedioTransporte,
        attributes: ["id", "nombre", "patente", "cantLugares"]
      }]
    });

    if (!viaje) return null;

    const totalAsientos = viaje.MedioTransporte?.cantLugares || viaje.cantPasajeros;

    const reservas = await Reserva.findAll({
      where: { viajes_id: id, eliminado: "no" },
      include: [{
        model: Pasajeros,
        where: { eliminado: "no", numeroAsiento: { [Op.not]: null } },
        required: false,
        attributes: ["id", "nombre", "apellido", "dni", "numeroAsiento", "ubicacionOrigen", "ubicacionDestino"]
      }]
    });

    const pasajeros = reservas.flatMap(r => r.Pasajeros || []);
    const ocupadosPorNumero = new Map(pasajeros.map(p => [p.numeroAsiento, p]));

    const mapaAsientos = [];
    for (let i = 1; i <= totalAsientos; i++) {
      const pasajero = ocupadosPorNumero.get(i);
      mapaAsientos.push({
        numero: i,
        ocupado: !!pasajero,
        pasajero: (pasajero && esStaff)
          ? {
              id: pasajero.id,
              nombre: pasajero.nombre,
              apellido: pasajero.apellido,
              dni: pasajero.dni,
              ubicacionOrigen: pasajero.ubicacionOrigen,
              ubicacionDestino: pasajero.ubicacionDestino
            }
          : null
      });
    }

    const asientosOcupados = pasajeros.length;
    const asientosLibres = totalAsientos - asientosOcupados;

    return {
      viajeId: viaje.id,
      origenLocalidad: viaje.origenLocalidad,
      destinoLocalidad: viaje.destinoLocalidad,
      fechaViaje: viaje.fechaViaje,
      horarioSalida: viaje.horarioSalida,
      medioTransporte: viaje.MedioTransporte,
      totalAsientos,
      asientosOcupados,
      asientosLibres,
      porcentajeOcupado: totalAsientos > 0
        ? Math.round((asientosOcupados / totalAsientos) * 100)
        : 0,
      mapaAsientos
    };
  }
}

module.exports = new ViajesService();
