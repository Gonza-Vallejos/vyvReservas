const { Localidad, Provincia } = require("../models");

class UbicacionService {
  async getLcaledades() {
    const localidades = await Localidad.findAll();
    return localidades.map(l => l.get({ plain: true }));
  }

  async getProvincias() {
    const provincias = await Provincia.findAll();
    return provincias.map(p => p.get({ plain: true }));
  }

  async getLocalidadById(id) {
    const localidad = await Localidad.findByPk(id);
    return localidad ? localidad.get({ plain: true }) : null;
  }

  async getProvinciaById(id) {
    const provincia = await Provincia.findByPk(id);
    return provincia ? provincia.get({ plain: true }) : null;
  }
}

module.exports = new UbicacionService();
