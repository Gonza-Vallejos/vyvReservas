const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');
const { autenticarToken, permitirPerfiles, PROFILES } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: Gestión de ventas y facturación
 */

/**
 * @swagger
 * /api/ventas:
 *   get:
 *     summary: Obtener todas las ventas
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.EMPRESA, PROFILES.MOSTRADOR), ventasController.obtenerVentas);

/**
 * @swagger
 * /api/ventas/{id}:
 *   get:
 *     summary: Obtener una venta por ID
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.EMPRESA, PROFILES.MOSTRADOR), ventasController.obtenerVentasPorId);

/**
 * @swagger
 * /api/ventas:
 *   post:
 *     summary: Crear una nueva venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [monto_total, id_reserva, metodo_pago]
 *             properties:
 *               monto_total:
 *                 type: number
 *               id_reserva:
 *                 type: integer
 *               metodo_pago:
 *                 type: string
 *                 example: "Efectivo"
 */
router.post('/', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.MOSTRADOR, PROFILES.CLIENTE, PROFILES.CHOFER), ventasController.crearVenta);

/**
 * @swagger
 * /api/ventas/{id}:
 *   put:
 *     summary: Actualizar una venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR), ventasController.actualizarVentas);

/**
 * @swagger
 * /api/ventas/{id}:
 *   delete:
 *     summary: Eliminar una venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR), ventasController.eliminarVentas);

/**
 * @swagger
 * /api/ventas/detalle/{id}:
 *   get:
 *     summary: Obtener detalle de venta por ID de reserva
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/detalle/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.CLIENTE, PROFILES.MOSTRADOR), ventasController.obtenerVentaDetalle);

/**
 * @swagger
 * /api/ventas/detalle-general/{id}:
 *   get:
 *     summary: Obtener detalle general (Viaje, Pasajeros, Empresa, Venta) por ID de reserva
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/detalle-general/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.CLIENTE, PROFILES.MOSTRADOR, PROFILES.CHOFER), ventasController.obtenerVentaDetalleGeneral);

/**
 * @swagger
 * /api/ventas/existe/reserva/{id}:
 *   get:
 *     summary: Verificar si existe venta para una reserva
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/existe/reserva/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.CLIENTE, PROFILES.MOSTRADOR, PROFILES.CHOFER), ventasController.existeReservaVenta);

/**
 * @swagger
 * /api/ventas/existe/pasajero/{id}:
 *   get:
 *     summary: Verificar si existe venta para un pasajero
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 */
router.get('/existe/pasajero/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.CLIENTE, PROFILES.MOSTRADOR, PROFILES.CHOFER), ventasController.existeVentaPorPasajero);

module.exports = router;
