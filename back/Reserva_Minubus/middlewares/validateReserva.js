const { body, validationResult } = require("express-validator");
const { Reserva, Usuario, Viajes } = require("../models");

const validarReserva = [
  // Validar usuarios_id
  body("usuarios_id")
    .notEmpty()
    .withMessage("El ID del usuario es requerido.")
    .toInt()
    .isInt()
    .withMessage("El ID del usuario debe ser un número entero.")
    .custom(async (usuarios_id, { req }) => {
      const uId = parseInt(usuarios_id, 10);
      const usuario = await Usuario.findByPk(uId);
      if (!usuario) {
        throw new Error("El usuario especificado no existe.");
      }

      return true;
    }),

  // Validar viajes_id
  body("viajes_id")
    .notEmpty()
    .withMessage("El ID del viaje es requerido.")
    .toInt()
    .isInt()
    .withMessage("El ID del viaje debe ser un número entero.")
    .custom(async (viajes_id, { req }) => {
      const vId = parseInt(viajes_id, 10);
      const viaje = await Viajes.findOne({
        where: { id: vId, eliminado: "no" }
      });
      if (!viaje) {
        throw new Error("El viaje especificado no existe o fue cancelado.");
      }

      if (viaje.cantPasajeros <= 0) {
        throw new Error("No quedan asientos disponibles para este viaje.");
      }

      return true;
    }),

  // Manejo de errores
  (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
      return res.status(400).json({ errores: error.array() });
    }
    next();
  },
];

module.exports = validarReserva;
