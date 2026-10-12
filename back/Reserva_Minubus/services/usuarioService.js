const { Usuario, UsuarioEmpresa, Empresa } = require("../models");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const { enviarCorreoVerificacion } = require("../controllers/authController");
const { PROFILES } = require("../utils/constants");

class UsuarioService {
  async getAll() {
    return await Usuario.findAll({
      where: { eliminado: "no" },
      attributes: { exclude: ["eliminado"] }
    });
  }

  async getById(id) {
    const usuario = await Usuario.findOne({
      where: { id, eliminado: "no" },
      attributes: { exclude: ["eliminado"] }
    });
    return usuario;
  }

  async create(userData) {
    const { contrasenia, email } = userData;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);
    const tokenVerificacion = uuidv4();

    const nuevoUsuario = await Usuario.create({
      ...userData,
      contrasenia: hashedPassword,
      perfil_id: PROFILES.CLIENTE,
      verificado: false,
      tokenVerificacion: tokenVerificacion,
    });

    await enviarCorreoVerificacion(email, tokenVerificacion);
    return nuevoUsuario;
  }

  async createEmployee(userData, empresaId) {
    const { contrasenia } = userData;
    const hashedPassword = await bcrypt.hash(contrasenia, 10);
    
    // Crear usuario ya verificado (lo crea su jefe)
    const nuevoUsuario = await Usuario.create({
      ...userData,
      contrasenia: hashedPassword,
      verificado: true
    });

    // Vincular con la empresa
    await UsuarioEmpresa.create({
      id_usuario: nuevoUsuario.id,
      id_empresa: empresaId
    });

    return nuevoUsuario;
  }

  async update(id, updateData) {
    const [rowsUpdated] = await Usuario.update(updateData, {
      where: { id, eliminado: "no" },
    });
    return rowsUpdated > 0;
  }

  async delete(id) {
    const [rowsUpdated] = await Usuario.update(
      { eliminado: "si" },
      { where: { id } }
    );
    return rowsUpdated > 0;
  }

  async updatePassword(id, contraseniaActual, nuevaContrasenia) {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) return { error: "NOT_FOUND" };

    const coincide = await bcrypt.compare(contraseniaActual, usuario.contrasenia);
    if (!coincide) return { error: "INVALID_PASSWORD" };

    const nuevaHash = await bcrypt.hash(nuevaContrasenia, 10);
    usuario.contrasenia = nuevaHash;
    await usuario.save();
    return { success: true };
  }

  async getChoferesAsociados() {
    return await Usuario.findAll({
      where: {
        perfil_id: PROFILES.CHOFER,
        eliminado: "no",
      },
      include: [
        {
          model: UsuarioEmpresa,
          required: true,
          include: [{ model: Empresa }],
        },
      ],
    });
  }

  async getChoferesByEmpresa(empresaId) {
    return await Usuario.findAll({
      where: {
        perfil_id: PROFILES.CHOFER,
        eliminado: "no",
      },
      include: [
        {
          model: UsuarioEmpresa,
          required: true,
          where: { id_empresa: empresaId },
          include: [{ model: Empresa }],
        },
      ],
    });
  }
}

module.exports = new UsuarioService();
