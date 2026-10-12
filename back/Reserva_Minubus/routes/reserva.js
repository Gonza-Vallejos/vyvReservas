const express = require('express');
const router = express.Router();
const reservaController = require('../controllers/reservaController');
const validateReserva = require('../middlewares/validateReserva');
const validatePasajero = require('../middlewares/validatePasajero');
const validateUpdatePasajero = require('../middlewares/validarUpdatePasajero');
const { autenticarToken, permitirPerfiles } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reservas
 *   description: Gestión de reservas y pasajeros
 */

/**
 * @swagger
 * /api/reserva:
 *   get:
 *     summary: Obtener todas las reservas
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioEmpresa', 'usuarioMostrador'), reservaController.obtenerReservas);

/**
 * @swagger
 * /api/reserva/usuario:
 *   get:
 *     summary: Obtener reservas por usuario
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/usuario', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente', 'usuarioEmpresa', 'usuarioMostrador'), reservaController.obtenerReservasPorUsuario);

/**
 * @swagger
 * /api/reserva/{id}:
 *   get:
 *     summary: Obtener una reserva por ID
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente', 'usuarioEmpresa', 'usuarioMostrador'), reservaController.obtenerReservaPorId);

/**
 * @swagger
 * /api/reserva:
 *   post:
 *     summary: Crear una nueva reserva con pasajeros
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [viajes_id, usuarios_id, pasajeros]
 *             properties:
 *               viajes_id:
 *                 type: integer
 *               usuarios_id:
 *                 type: integer
 *               asientos_reservados:
 *                 type: integer
 *               pasajeros:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     apellido:
 *                       type: string
 *                     dni:
 *                       type: integer
 */
router.post('/', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente', 'usuarioEmpresa', 'usuarioMostrador'), validateReserva, validatePasajero, reservaController.crearReserva);

/**
 * @swagger
 * /api/reserva/{id}:
 *   put:
 *     summary: Actualizar una reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente'), validateUpdatePasajero, reservaController.actualizarReserva);

/**
 * @swagger
 * /api/reserva/{id}:
 *   delete:
 *     summary: Eliminar una reserva (lógico)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador', 'usuarioCliente'), reservaController.eliminarReserva);

/**
 * @swagger
 * /api/reserva/pasajero/{id}:
 *   delete:
 *     summary: Eliminar un pasajero de una reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/pasajero/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador', 'usuarioCliente', 'usuarioChofer'), reservaController.eliminarPasajero);

/**
 * @swagger
 * /api/reserva/{id}/pasajeros:
 *   get:
 *     summary: Listar pasajeros por reserva
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/pasajeros', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador', 'usuarioCliente'), reservaController.listarPasajerosPorReserva);

/**
 * @swagger
 * /api/reserva/pasajeros/all:
 *   get:
 *     summary: Listar todos los pasajeros (Admin)
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/pasajeros/all', autenticarToken, permitirPerfiles('usuarioAdministrador'), reservaController.listarTodosLosPasajeros);

/**
 * @swagger
 * /api/reserva/viaje/{id}/pasajeros:
 *   get:
 *     summary: Listar pasajeros por viaje
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/viaje/:id/pasajeros', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador', 'usuarioChofer', 'usuarioEmpresa'), reservaController.listarPasajerosPorViaje);

/**
 * @swagger
 * /api/reserva/empresa/{id}:
 *   get:
 *     summary: Obtener reservas por empresa
 *     tags: [Reservas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/empresa/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador', 'usuarioEmpresa'), reservaController.obtenerReservasPorEmpresa);

// Rutas de compatibilidad para endpoints de la app móvil
router.post('/crearReserva', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente'), validateReserva, validatePasajero, reservaController.crearReserva);
router.get('/obtenerReservasPorUsuario', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente', 'usuarioEmpresa', 'usuarioMostrador'), reservaController.obtenerReservasPorUsuario);
router.put('/actualizarReserva/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioCliente'), validateUpdatePasajero, reservaController.actualizarReserva);
router.put('/eliminarReserva/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador', 'usuarioCliente'), reservaController.eliminarReserva);
router.put('/eliminarPasajero/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador', 'usuarioCliente', 'usuarioChofer'), reservaController.eliminarPasajero);
router.get('/listarPasajeroPorId/:id', autenticarToken, reservaController.obtenerReservaPorId);
router.get('/listarPasajerosPorReserva/:id', autenticarToken, reservaController.listarPasajerosPorReserva);
router.get('/listarPasajeroPorViaje/:id', autenticarToken, reservaController.listarPasajerosPorViaje);
router.get('/listarReservasPorViaje/:id', autenticarToken, reservaController.listarPasajerosPorViaje);
router.get('/listarReservasYPasajerosPorViaje/:id', autenticarToken, reservaController.listarPasajerosPorViaje);
router.get('/obtenerReservasPorEmpresa/:id', autenticarToken, reservaController.obtenerReservasPorEmpresa);

module.exports = router;
