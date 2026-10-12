const { Reserva, Usuario, Viajes, Ventas, DetalleVenta, UsuarioEmpresa, MedioTransporte, Pasajeros } = require("../models");
const { Sequelize, Op } = require("sequelize");

class ReportesService {
  async getTopClientes(empresaId) {
    const data = await Reserva.findAll({
      attributes: [
        "usuarios_id",
        [Sequelize.fn("COUNT", Sequelize.col("Reserva.id")), "cantidadReservas"],
      ],
      include: [
        { model: Usuario, attributes: ["id", "nombre", "apellido", "email", "usuario"] },
        {
          model: Viajes,
          attributes: [],
          include: [{ model: UsuarioEmpresa, where: { id_empresa: empresaId } }]
        },
        { model: Ventas, required: true, include: [{ model: DetalleVenta, required: true }] }
      ],
      where: { eliminado: "no" },
      group: ["Reserva.usuarios_id", "Usuario.id"],
      order: [[Sequelize.literal("cantidadReservas"), "DESC"]],
      raw: true,
      nest: true
    });
    return data;
  }

  async getGananciaTotal(empresaId) {
    const viajes = await Viajes.findAll({
      where: { eliminado: "no" },
      include: [
        { model: MedioTransporte, where: { empresa_id: empresaId } },
        {
          model: Reserva,
          where: { eliminado: "no" },
          include: [{
            model: Ventas,
            where: { eliminado: "no" },
            include: [{ model: DetalleVenta, where: { eliminado: "no" } }]
          }]
        }
      ]
    });

    let totalGanancia = 0;
    viajes.forEach(v => v.Reservas.forEach(r => r.Ventas.forEach(ve => ve.DetalleVenta.forEach(d => totalGanancia += d.precioFinal))));
    return { totalGanancia, viajes };
  }

  async getGananciasPorViaje(empresaId) {
    const viajes = await Viajes.findAll({
      where: { eliminado: "no" },
      include: [
        { model: MedioTransporte, where: { empresa_id: empresaId } },
        {
          model: Reserva,
          where: { eliminado: "no" },
          include: [{
            model: Ventas,
            where: { eliminado: "no" },
            include: [{ model: DetalleVenta, where: { eliminado: "no" } }]
          }]
        }
      ]
    });

    return viajes.map(v => {
      let total = 0;
      v.Reservas?.forEach(r => r.Ventas?.forEach(ve => ve.DetalleVenta?.forEach(d => total += d.precioFinal)));
      return { viaje: v, totalGanancia: total };
    });
  }

  async getReservasSinVenta(empresaId) {
    const hoy = new Date();
    const reservas = await Reserva.findAll({
      where: { eliminado: "no" },
      include: [
        { model: Usuario },
        {
          model: Viajes,
          where: { fechaViaje: { [Op.lt]: hoy.toISOString().split("T")[0] } },
          include: [{ model: UsuarioEmpresa, where: { id_empresa: empresaId } }]
        },
        { model: Ventas, required: false },
        { model: Pasajeros, where: { eliminado: "no" } }
      ]
    });
    return reservas.filter(r => !r.Ventas || r.Ventas.length === 0);
  }
}

module.exports = new ReportesService();
