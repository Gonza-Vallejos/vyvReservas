const express = require("express");
const router = express.Router();
const empresaController = require("../controllers/empresaController");
const validateEmpresa = require("../middlewares/validateEmpresa");
const validateUpdateEmpresa = require("../middlewares/validateUpdateEmpresa");
const validateAsignarDueno = require("../middlewares/validateAsignarDueno");
const { autenticarToken, permitirPerfiles, requireOwnership, PROFILES } = require("../middlewares/authMiddleware");

/**
 * @swagger
 * tags:
 *   name: Empresas
 *   description: Gestión de empresas
 */

/**
 * @swagger
 * /api/empresa:
 *   get:
 *     summary: Obtener todas las empresas
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empresas
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
// El listado global de empresas es exclusivo del super administrador.
router.get("/", autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR), empresaController.obtenerEmpresas);

/**
 * @swagger
 * /api/empresa/{id}:
 *   get:
 *     summary: Obtener una empresa por ID
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get("/:id", autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.EMPRESA), empresaController.obtenerEmpresaId);

/**
 * @swagger
 * /api/empresa:
 *   post:
 *     summary: Crear una nueva empresa
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, cuit, email, localidad_id]
 *             properties:
 *               nombre:
 *                 type: string
 *               direccion:
 *                 type: string
 *               cuit:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               localidad_id:
 *                 type: integer
 */
router.post("/", autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR), validateEmpresa, empresaController.crearEmpresa);

/**
 * @swagger
 * /api/empresa/{id}:
 *   put:
 *     summary: Actualizar una empresa
 *     tags: [Empresas]
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
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 */
router.put("/:id", autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.EMPRESA), validateUpdateEmpresa, empresaController.actualizarEmpresa);

/**
 * @swagger
 * /api/empresa/{id}:
 *   delete:
 *     summary: Eliminar una empresa (lógico)
 *     tags: [Empresas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete("/:id", autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR), empresaController.eliminarEmpresa);

/**
 * @swagger
 * /api/empresa/{id}/asignar-dueño:
 *   put:
 *     summary: Asignar un usuario como dueño de la empresa
 *     tags: [Empresas]
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
 *             required: [usuarioId]
 *             properties:
 *               usuarioId:
 *                 type: integer
 */
router.put("/:id/asignar-dueño", autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR), validateAsignarDueno, empresaController.asignarDueno);

module.exports = router;
