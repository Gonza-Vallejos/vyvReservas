const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const { autenticarToken, permitirPerfiles } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Pagos
 *   description: Pagos con Mercado Pago
 */

/**
 * @swagger
 * /api/pagos/crear-preferencia:
 *   post:
 *     summary: Crear preferencia de pago en Mercado Pago
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reserva_id]
 *             properties:
 *               reserva_id:
 *                 type: integer
 */
router.post('/crear-preferencia', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente', 'usuarioMostrador'), pagoController.crearPreferencia);

/**
 * @swagger
 * /api/pagos/webhook:
 *   post:
 *     summary: Webhook de notificaciones de Mercado Pago
 *     tags: [Pagos]
 */
router.post('/webhook', pagoController.webhook);

/**
 * @swagger
 * /api/pagos/ipn:
 *   get:
 *     summary: IPN fallback de Mercado Pago
 *     tags: [Pagos]
 */
router.get('/ipn', pagoController.webhook);

/** 
 * 
 * @swagger
 * /api/pagos/reserva/{reservaId}:
 *   get:
 *     summary: Obtener pagos de una reserva
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/reserva/:reservaId', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente', 'usuarioMostrador'), pagoController.obtenerPagosPorReserva);

/**
 * @swagger
 * /api/pagos/estado/{reservaId}:
 *   get:
 *     summary: Ver estado actual del pago de una reserva
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/estado/:reservaId', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente', 'usuarioMostrador'), pagoController.obtenerEstadoPago);

/**
 * @swagger
 * /api/pagos/reintentar/{reservaId}:
 *   post:
 *     summary: Crear una nueva preferencia para una reserva con pago fallido/pendiente
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 */
router.post('/reintentar/:reservaId', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente', 'usuarioMostrador'), pagoController.reintentarPago);

module.exports = router;
