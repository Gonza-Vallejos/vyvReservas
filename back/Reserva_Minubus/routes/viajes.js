const express = require('express');
const router = express.Router();
const viajesController = require('../controllers/viajesController');
const validateViaje = require('../middlewares/validateViajes');
const validateUpdateViaje = require('../middlewares/validateUpdateViajes');
const { autenticarToken, permitirPerfiles } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Viajes
 *   description: Gestión de viajes y rutas
 */

/**
 * @swagger
 * /api/viajes:
 *   get:
 *     summary: Obtener todos los viajes
 *     tags: [Viajes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', autenticarToken, permitirPerfiles('usuarioMostrador', 'usuarioAdministrador', 'usuarioEmpresa'), viajesController.obtenerViajes);

/**
 * @swagger
 * /api/viajes/disponibles:
 *   get:
 *     summary: Obtener viajes disponibles (para clientes)
 *     tags: [Viajes]
 */
router.get('/disponibles', viajesController.obtenerViajesDisponibles);

/**
 * @swagger
 * /api/viajes/{id}:
 *   get:
 *     summary: Obtener un viaje por ID
 *     tags: [Viajes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/:id', autenticarToken, permitirPerfiles('usuarioMostrador', 'usuarioAdministrador', 'usuarioEmpresa', 'usuarioCliente'), viajesController.obtenerViajePorId);

/**
 * @swagger
 * /api/viajes:
 *   post:
 *     summary: Crear un nuevo viaje
 *     tags: [Viajes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [origenLocalidad, destinoLocalidad, horarioSalida, fechaViaje, precio, usuarioEmpresa_id, medioTransporte_id]
 *             properties:
 *               origenLocalidad:
 *                 type: string
 *               destinoLocalidad:
 *                 type: string
 *               horarioSalida:
 *                 type: string
 *                 example: "10:00:00"
 *               fechaViaje:
 *                 type: string
 *                 format: date
 *               precio:
 *                 type: number
 *               usuarioEmpresa_id:
 *                 type: integer
 *               medioTransporte_id:
 *                 type: integer
 */
router.post('/', autenticarToken, permitirPerfiles('usuarioMostrador', 'usuarioAdministrador', 'usuarioEmpresa'), validateViaje, viajesController.crearViaje);

/**
 * @swagger
 * /api/viajes/{id}:
 *   put:
 *     summary: Actualizar un viaje
 *     tags: [Viajes]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', autenticarToken, permitirPerfiles('usuarioMostrador', 'usuarioAdministrador', 'usuarioEmpresa'), validateUpdateViaje, viajesController.actualizarViajes);

/**
 * @swagger
 * /api/viajes/{id}:
 *   delete:
 *     summary: Eliminar un viaje
 *     tags: [Viajes]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', autenticarToken, permitirPerfiles('usuarioMostrador', 'usuarioAdministrador', 'usuarioEmpresa'), viajesController.eliminarViajes);

/**
 * @swagger
 * /api/viajes/empresa/{id}:
 *   get:
 *     summary: Obtener viajes por empresa
 *     tags: [Viajes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/empresa/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioEmpresa', 'usuarioMostrador'), viajesController.obtenerViajesPorEmpresa);

/**
 * @swagger
 * /api/viajes/chofer/{id}:
 *   get:
 *     summary: Obtener viajes por chofer
 *     tags: [Viajes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/chofer/:id', autenticarToken, permitirPerfiles('usuarioMostrador', 'usuarioAdministrador', 'usuarioChofer', 'usuarioEmpresa'), viajesController.obtenerViajesPorChofer);

/**
 * @swagger
 * /api/viajes/existe-reserva/{id}:
 *   get:
 *     summary: Verificar si existe reserva para un viaje
 *     tags: [Viajes]
 *     security:
 *       - bearerAuth: []
 */
router.get('/existe-reserva/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente', 'usuarioMostrador', 'usuarioChofer'), viajesController.existeReservaParaViaje);

// Rutas de compatibilidad para app móvil
router.get('/viajesDisponible', viajesController.obtenerViajesDisponibles);
router.get('/obtenerViajesId/:id', autenticarToken, permitirPerfiles('usuarioMostrador', 'usuarioAdministrador', 'usuarioEmpresa', 'usuarioCliente'), viajesController.obtenerViajePorId);

module.exports = router;
