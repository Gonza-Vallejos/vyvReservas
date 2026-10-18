const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const { autenticarToken, permitirPerfiles, PROFILES } = require('../middlewares/authMiddleware');

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
router.post('/crear-preferencia', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.CLIENTE, PROFILES.MOSTRADOR), pagoController.crearPreferencia);

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
router.get('/reserva/:reservaId', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.CLIENTE, PROFILES.MOSTRADOR), pagoController.obtenerPagosPorReserva);

/**
 * @swagger
 * /api/pagos/estado/{reservaId}:
 *   get:
 *     summary: Ver estado actual del pago de una reserva
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/estado/:reservaId', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.CLIENTE, PROFILES.MOSTRADOR), pagoController.obtenerEstadoPago);

/**
 * @swagger
 * /api/pagos/reintentar/{reservaId}:
 *   post:
 *     summary: Crear una nueva preferencia para una reserva con pago fallido/pendiente
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 */
router.post('/reintentar/:reservaId', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.CLIENTE, PROFILES.MOSTRADOR), pagoController.reintentarPago);

/**
 * @swagger
 * /api/pagos/metricas-comisiones:
 *   get:
 *     summary: Obtener métricas y recaudación de comisiones de la plataforma (Super Admin)
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/metricas-comisiones', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR), pagoController.obtenerMetricasComisiones);

/**
 * @swagger
 * /api/pagos/comision-empresa/{empresaId}:
 *   put:
 *     summary: Actualizar porcentaje de comisión de una empresa (Super Admin)
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 */
router.put('/comision-empresa/:empresaId', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR), pagoController.actualizarComisionEmpresa);

/**
 * @swagger
 * /api/pagos/oauth/url/{empresaId}:
 *   get:
 *     summary: Obtener URL de autorización OAuth de Mercado Pago para una empresa
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 */
router.get('/oauth/url/:empresaId', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.EMPRESA), pagoController.generarUrlOAuth);

/**
 * @swagger
 * /api/pagos/oauth/vincular/{empresaId}:
 *   post:
 *     summary: Vincular cuenta de Mercado Pago a una empresa
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 */
router.post('/oauth/vincular/:empresaId', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.EMPRESA), pagoController.vincularMercadoPago);

/**
 * @swagger
 * /api/pagos/oauth/desvincular/{empresaId}:
 *   delete:
 *     summary: Desvincular cuenta de Mercado Pago de una empresa
 *     tags: [Pagos]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/oauth/desvincular/:empresaId', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.EMPRESA), pagoController.desvincularMercadoPago);

module.exports = router;
