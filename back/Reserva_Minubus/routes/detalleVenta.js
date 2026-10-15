const express = require("express");
const router = express.Router();
const ventasController = require("../controllers/ventasController");
const { autenticarToken, permitirPerfiles, PROFILES } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: DetalleVenta
 *   description: Gestión de detalles de facturación
 */

/**
 * @swagger
 * /api/detalle-venta:
 *   post:
 *     summary: Crear detalle de venta (Manual)
 *     tags: [DetalleVenta]
 */
router.post(
  "/",
  autenticarToken,
  permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.CLIENTE, PROFILES.CHOFER),
  ventasController.crearVenta // Reusing the main create method which handles details
);

module.exports = router;
