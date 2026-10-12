const { Ventas, DetalleVenta, Reserva, Viajes, Pasajeros, MedioTransporte, Empresa } = require("../models");

class VentasService {
  async getAll() {
    return await Ventas.findAll({
      where: { eliminado: "no" },
      include: [DetalleVenta]
    });
  }

  async getById(id) {
    return await Ventas.findOne({
      where: { id, eliminado: "no" },
      include: [DetalleVenta]
    });
  }

  async create(ventaData, detalleData) {
    const { reserva_id } = ventaData;
    
    const nuevaVenta = await Ventas.create(ventaData);
    
    if (detalleData) {
      const reserva = await Reserva.findByPk(reserva_id);
      if (!reserva) throw new Error("RESERVA_NOT_FOUND");
      
      const viaje = await Viajes.findByPk(reserva.viajes_id);
      if (!viaje) throw new Error("VIAJE_NOT_FOUND");

      const subTotal = viaje.precio * ventaData.totalVentas;
      const precioFinal = subTotal - (detalleData.descuento || 0);

      await DetalleVenta.create({
        ...detalleData,
        subTotal,
        precioFinal,
        ventas_id: nuevaVenta.id
      });
    }

    return nuevaVenta;
  }

  async update(id, updateData) {
    const [rowsUpdated] = await Ventas.update(updateData, {
      where: { id, eliminado: "no" }
    });
    return rowsUpdated > 0;
  }

  async delete(id) {
    const [rowsUpdated] = await Ventas.update({ eliminado: "si" }, { where: { id } });
    return rowsUpdated > 0;
  }

  async getVentaDetalle(reservaId) {
    const venta = await Ventas.findOne({
      where: { reserva_id: reservaId },
      include: [DetalleVenta]
    });
    return venta;
  }

  async getVentaDetalleGeneral(reservaId) {
    const venta = await Ventas.findOne({
      where: { reserva_id: reservaId },
      include: [
        {
          model: DetalleVenta
        },
        {
          model: Reserva,
          include: [
            {
              model: Viajes,
              include: [
                {
                  model: MedioTransporte,
                  include: [Empresa]
                }
              ]
            },
            {
              model: Pasajeros,
              where: { eliminado: "no" }
            }
          ]
        }
      ]
    });
    return venta;
  }

  async checkExistByReserva(reservaId) {
    const venta = await Ventas.findOne({ where: { reserva_id: reservaId } });
    return !!venta;
  }

  async checkExistByPasajero(pasajeroId) {
    const pasajero = await Pasajeros.findByPk(pasajeroId);
    if (!pasajero) throw new Error("PASAJERO_NOT_FOUND");
    return await this.checkExistByReserva(pasajero.reserva_id);
  }
}

module.exports = new VentasService();
