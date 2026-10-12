const { Empresa } = require("../models");

class EmpresaService {
  async getAll() {
    return await Empresa.findAll({
      where: { eliminado: "no" },
      attributes: { exclude: ["eliminado"] }
    });
  }

  async getById(id) {
    const empresa = await Empresa.findOne({
      where: { id, eliminado: "no" },
      attributes: { exclude: ["eliminado"] }
    });
    return empresa;
  }

  async create(empresaData) {
    return await Empresa.create(empresaData);
  }

  async update(id, updateData) {
    const [rowsUpdated] = await Empresa.update(updateData, {
      where: { id, eliminado: "no" },
      fields: ["nombre", "direccion", "telefono", "email"]
    });
    return rowsUpdated > 0;
  }

  async delete(id) {
    const [rowsUpdated] = await Empresa.update(
      { eliminado: "si" },
      { where: { id } }
    );
    return rowsUpdated > 0;
  }
}

module.exports = new EmpresaService();
