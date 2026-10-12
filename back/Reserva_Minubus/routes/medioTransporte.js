const express = require('express');
const router = express.Router();
const transporteController = require('../controllers/medio_transporteController');
const validateMedioTransporte = require('../middlewares/validateMedio_Transporte');
const validateUpdateTransporte = require('../middlewares/validateUpdateMedio_Transporte');
const { autenticarToken, permitirPerfiles } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: MedioTransporte
 *   description: Gestión de medios de transporte (Minubuses)
 */

/**
 * @swagger
 * /api/medio-transporte:
 *   get:
 *     summary: Obtener todos los transportes
 *     tags: [MedioTransporte]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioEmpresa', 'usuarioMostrador'), transporteController.obtenerTransportes);

/**
 * @swagger
 * /api/medio-transporte/empresa/{id}:
 *   get:
 *     summary: Obtener transportes por empresa
 *     tags: [MedioTransporte]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/empresa/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioEmpresa', 'usuarioMostrador'), transporteController.obtenerTransportesPorEmpresa);

/**
 * @swagger
 * /api/medio-transporte:
 *   post:
 *     summary: Crear un nuevo transporte
 *     tags: [MedioTransporte]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, patente, marca, cantLugares, empresa_id]
 *             properties:
 *               nombre:
 *                 type: string
 *               patente:
 *                 type: string
 *               marca:
 *                 type: string
 *               cantLugares:
 *                 type: integer
 *               empresa_id:
 *                 type: integer
 */
router.post('/', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador'), validateMedioTransporte, transporteController.crearTransporte);

/**
 * @swagger
 * /api/medio-transporte/{id}:
 *   get:
 *     summary: Obtener un transporte por ID
 *     tags: [MedioTransporte]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioEmpresa', 'usuarioMostrador'), transporteController.obtenerTransportePorId);

/**
 * @swagger
 * /api/medio-transporte/{id}:
 *   put:
 *     summary: Actualizar un transporte
 *     tags: [MedioTransporte]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               patente:
 *                 type: string
 *               marca:
 *                 type: string
 *               cantLugares:
 *                 type: integer
 */
router.put('/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador'), validateUpdateTransporte, transporteController.actualizarTransporte);

/**
 * @swagger
 * /api/medio-transporte/{id}:
 *   delete:
 *     summary: Eliminar un transporte
 *     tags: [MedioTransporte]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador'), transporteController.eliminarTransporte);

/**
 * @swagger
 * /api/medio-transporte/{id}/viajes:
 *   get:
 *     summary: Obtener viajes por transporte
 *     tags: [MedioTransporte]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/viajes', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador'), transporteController.obtenerViajesPorTransporte);

/**
 * @swagger
 * /api/medio-transporte/{id}/sin-reservas:
 *   get:
 *     summary: Verificar si el transporte no tiene reservas
 *     tags: [MedioTransporte]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id/sin-reservas', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioMostrador'), transporteController.verificarTransporteSinReservas);

module.exports = router;