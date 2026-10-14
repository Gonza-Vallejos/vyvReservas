const { Usuario, Perfil, UsuarioEmpresa, Sequelize } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

class AuthService {
  async login(usuario, contrasenia) {
    const cleanUser = usuario ? usuario.trim() : '';
    const cleanPass = contrasenia ? contrasenia.trim() : '';

    const user = await Usuario.findOne({
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('usuario')), cleanUser.toLowerCase()),
          Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('email')), cleanUser.toLowerCase())
        ]
      },
      include: [Perfil, UsuarioEmpresa]
    });

    if (!user) throw new Error("USER_NOT_FOUND");

    const valid = await bcrypt.compare(cleanPass, user.contrasenia);
    if (!valid) throw new Error("INVALID_PASSWORD");

    const empresaId = user.UsuarioEmpresas?.[0]?.id_empresa || null;
    const tipoPerfil = user.Perfil ? user.Perfil.tipo : 'usuarioCliente';

    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        perfil: tipoPerfil,
        empresa_id: empresaId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return { 
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        dni: user.dni,
        telefono: user.telefono,
        email: user.email,
        usuario: user.usuario,
        perfil_id: user.perfil_id,
        perfil: user.Perfil.tipo,
        id_empresa: empresaId
      }
    };
  }

  async verifyToken(token) {
    const usuario = await Usuario.findOne({ where: { tokenVerificacion: token } });
    if (!usuario) throw new Error("INVALID_TOKEN");

    usuario.verificado = true;
    usuario.tokenVerificacion = null;
    usuario.fechaVerificacion = new Date();
    await usuario.save();
    return usuario;
  }

  async sendVerificationEmail(email, token) {
    const link = `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/verificar/${token}`;
    await transporter.sendMail({
      from: '"Reservas 🚌" <vyvreservas25@gmail.com>',
      to: email,
      subject: "Verificá tu cuenta",
      html: `<h3>¡Gracias por registrarte!</h3><p>Hacé clic en el botón para verificar tu cuenta:</p><a href="${link}">Verificar cuenta</a>`
    });
  }

  async requestPasswordReset(email) {
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return; // Silent return for security

    const token = crypto.randomBytes(32).toString("hex");
    usuario.recuperacionToken = token;
    usuario.recuperacionTokenExpira = new Date(Date.now() + 3600000);
    await usuario.save();

    const link = `${process.env.BASE_URL || 'http://localhost:3000'}/api/auth/abrir-app/${token}`;
    await transporter.sendMail({
      from: '"Reservas 🚌" <vyvreservas25@gmail.com>',
      to: email,
      subject: "Restablecer contraseña",
      html: `<p>Hacé clic en el botón para cambiar tu contraseña:</p><a href="${link}">Restablecer contraseña</a>`
    });
  }

  async resetPassword(token, nuevaContrasenia) {
    const usuario = await Usuario.findOne({
      where: {
        recuperacionToken: token,
        recuperacionTokenExpira: { [Op.gt]: new Date() }
      }
    });
    if (!usuario) throw new Error("INVALID_OR_EXPIRED_TOKEN");

    usuario.contrasenia = await bcrypt.hash(nuevaContrasenia, 10);
    usuario.recuperacionToken = null;
    usuario.recuperacionTokenExpira = null;
    await usuario.save();
  }
}

module.exports = new AuthService();
