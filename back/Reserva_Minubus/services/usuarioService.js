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
    const perfilId = Number(userData.perfil_id);
    if (![PROFILES.CHOFER, PROFILES.MOSTRADOR].includes(perfilId)) {
      throw new Error("INVALID_EMPLOYEE_PROFILE");
    }

    if (!empresaId) {
      throw new Error("EMPRESA_REQUIRED");
    }

    const rawPassword = userData.contrasenia || '123456';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);
    
    // Si no enviaron 'usuario', autogenerar basado en nombre.apellido o DNI
    const baseUsername = userData.usuario 
      ? userData.usuario.trim().toLowerCase() 
      : `${(userData.nombre || 'user').trim().toLowerCase().replace(/\s+/g, '')}.${(userData.dni || Math.floor(Math.random()*10000))}`.slice(0, 24);

    const telefono = userData.telefono || `3794${Math.floor(100000 + Math.random() * 900000)}`;

    // Crear usuario ya verificado (lo crea la empresa)
    const nuevoUsuario = await Usuario.create({
      nombre: userData.nombre?.trim(),
      apellido: userData.apellido?.trim(),
      dni: parseInt(userData.dni, 10),
      email: userData.email?.trim().toLowerCase(),
      telefono,
      usuario: baseUsername,
      contrasenia: hashedPassword,
      perfil_id: perfilId,
      verificado: true,
      eliminado: "no"
    });

    // Vincular con la empresa si se especificó
    if (empresaId) {
      await UsuarioEmpresa.create({
        id_usuario: nuevoUsuario.id,
        id_empresa: parseInt(empresaId, 10)
      });
    }

    return nuevoUsuario;
  }

  async update(id, updateData) {
    const allowedFields = ["nombre", "apellido", "dni", "telefono", "email", "usuario"];
    const changes = Object.fromEntries(
      Object.entries(updateData).filter(([key, value]) => allowedFields.includes(key) && value !== undefined)
    );

    if (changes.dni !== undefined) changes.dni = Number(changes.dni);
    if (changes.nombre !== undefined) changes.nombre = String(changes.nombre).trim();
    if (changes.apellido !== undefined) changes.apellido = String(changes.apellido).trim();
    if (changes.telefono !== undefined) changes.telefono = String(changes.telefono).replace(/\D/g, "");

    const [rowsUpdated] = await Usuario.update(changes, {
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
