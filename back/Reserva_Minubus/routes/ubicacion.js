const express = require('express');
const router = express.Router();
const ubicacionController = require('../controllers/ubicacionController');

/**
 * @swagger
 * tags:
 *   name: Ubicacion
 *   description: Información geográfica (Provincias y Localidades)
 */

/**
 * @swagger
 * /api/ubicacion/localidades:
 *   get:
 *     summary: Obtener todas las localidades
 *     tags: [Ubicacion]
 *     responses:
 *       200:
 *         description: Lista de localidades
 */
router.get('/localidades', ubicacionController.obtenerLocalidades);

/**
 * @swagger
 * /api/ubicacion/provincias:
 *   get:
 *     summary: Obtener todas las provincias
 *     tags: [Ubicacion]
 *     responses:
 *       200:
 *         description: Lista de provincias
 */
router.get('/provincias', ubicacionController.obtenerProvincias);

/**
 * @swagger
 * /api/ubicacion/localidades/{id}:
 *   get:
 *     summary: Obtener localidad por ID
 *     tags: [Ubicacion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/localidades/:id', ubicacionController.obtenerLocalidadesId);

/**
 * @swagger
 * /api/ubicacion/provincias/{id}:
 *   get:
 *     summary: Obtener provincia por ID
 *     tags: [Ubicacion]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 */
router.get('/provincias/:id', ubicacionController.obtenerProvinciasId);

module.exports = router;