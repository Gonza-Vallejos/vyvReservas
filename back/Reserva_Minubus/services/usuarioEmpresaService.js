const { Usuario, Empresa, UsuarioEmpresa } = require("../models");

class UsuarioEmpresaService {
  async associate(usuarioId, empresaId) {
    const usuario = await Usuario.findByPk(usuarioId);
    const empresa = await Empresa.findByPk(empresaId);

    if (!usuario || !empresa) throw new Error("NOT_FOUND");

    const existing = await UsuarioEmpresa.findOne({ where: { id_usuario: usuarioId } });
    if (existing) throw new Error("ALREADY_ASSOCIATED");

    await usuario.addEmpresa(empresa);
    return true;
  }

  async dissociate(usuarioId) {
    const asociacion = await UsuarioEmpresa.findOne({ where: { id_usuario: usuarioId } });
    if (!asociacion) throw new Error("NOT_ASSOCIATED");

    await UsuarioEmpresa.destroy({ where: { id_usuario: usuarioId } });
    return true;
  }

  async getEmpresaByUsuario(usuarioId) {
    const asociacion = await UsuarioEmpresa.findOne({ where: { id_usuario: usuarioId } });
    return asociacion ? asociacion.id_empresa : null;
  }

  async getUsuariosByEmpresa(empresaId) {
    const items = await UsuarioEmpresa.findAll({
      where: { id_empresa: empresaId },
      include: [{
        model: Usuario,
        where: { eliminado: "no" },
        attributes: ["id", "nombre", "apellido", "email", "usuario", "telefono", "perfil_id"]
      }]
    });
    return items.map(i => ({
      ...i.Usuario.toJSON(),
      usuarioEmpresa_id: i.id,
    }));
  }
}

module.exports = new UsuarioEmpresaService();
