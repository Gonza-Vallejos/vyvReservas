const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportesController');
const { autenticarToken, permitirPerfiles } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Reportes
 *   description: Generación de informes y estadísticas
 */

/**
 * @swagger
 * /api/reportes/empresa/{id}/top-clientes:
 *   get:
 *     summary: Obtener clientes con más ventas confirmadas por empresa
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la Empresa
 */
router.get('/empresa/:id/top-clientes', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioEmpresa', 'usuarioMostrador'), reportesController.obtenerClientesConVentasConfirmadasPorEmpresa);

/**
 * @swagger
 * /api/reportes/empresa/{id}/ganancia-total:
 *   get:
 *     summary: Obtener ganancia total por empresa
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/empresa/:id/ganancia-total', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioEmpresa', 'usuarioMostrador'), reportesController.obtenerGananciaTotalPorEmpresa);

/**
 * @swagger
 * /api/reportes/empresa/{id}/ganancia-viajes:
 *   get:
 *     summary: Obtener ganancias detalladas por viaje
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/empresa/:id/ganancia-viajes', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioEmpresa', 'usuarioMostrador'), reportesController.obtenerGananciasPorViajePorEmpresa);

/**
 * @swagger
 * /api/reportes/empresa/{id}/reservas-sin-venta:
 *   get:
 *     summary: Obtener usuarios con reservas pero sin venta en viajes pasados
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/empresa/:id/reservas-sin-venta', autenticarToken, permitirPerfiles('usuarioAdministrador', 'usuarioEmpresa', 'usuarioMostrador'), reportesController.obtenerUsuariosConReservasSinVenta);

module.exports = router;