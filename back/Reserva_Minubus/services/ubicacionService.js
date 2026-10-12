const { Localidad, Provincia } = require("../models");

class UbicacionService {
  async getLocalidades() {
    return await Localidad.findAll();
  }

  async getProvincias() {
    return await Provincia.findAll();
  }

  async getLocalidadById(id) {
    return await Localidad.findByPk(id);
  }

  async getProvinciaById(id) {
    return await Provincia.findByPk(id);
  }
}

module.exports = new UbicacionService();
