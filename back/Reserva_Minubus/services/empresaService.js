const { Empresa, Usuario } = require("../models");

class EmpresaService {
  async getAll() {
    const empresas = await Empresa.findAll({
      where: { eliminado: "no" },
      attributes: { exclude: ["eliminado"] },
      include: [
        {
          model: Usuario,
          through: { attributes: [] },
          where: { perfil_id: 5, eliminado: "no" },
          required: false,
          attributes: ["id", "nombre", "apellido", "email", "usuario", "telefono", "perfil_id"]
        }
      ]
    });
    return empresas.map((emp) => {
      const json = emp.toJSON();
      const dueno = json.Usuarios?.[0] || null;
      return {
        ...json,
        dueno,
        id_dueno: dueno?.id || null
      };
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
