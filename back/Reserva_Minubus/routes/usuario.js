const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const validateUsuario = require('../middlewares/validateUsuario');
const validateUpdateUsuario = require('../middlewares/validateUpdateUsuario');
const validateUpdateContrasenia = require('../middlewares/validateUdateContrasenia');
const { autenticarToken, permitirPerfiles, authorize, PROFILES } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Usuarios
 *   description: Gestión de usuarios
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.MOSTRADOR, PROFILES.EMPRESA), usuarioController.obtenerUsuarios);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   get:
 *     summary: Obtener un usuario por ID
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del usuario
 */
router.get('/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.MOSTRADOR, PROFILES.EMPRESA, PROFILES.CLIENTE, PROFILES.CHOFER), usuarioController.obtenerUsuarioPorId);

/**
 * @swagger
 * /api/usuarios:
 *   post:
 *     summary: Crear un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - apellido
 *               - dni
 *               - email
 *               - usuario
 *               - contrasenia
 *               - perfil_id
 *             properties:
 *               nombre:
 *                 type: string
 *               apellido:
 *                 type: string
 *               dni:
 *                 type: integer
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               usuario:
 *                 type: string
 *               contrasenia:
 *                 type: string
 *               perfil_id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Usuario creado
 */
router.post('/', validateUsuario, usuarioController.crearUsuario);

router.post('/registrar-empleado', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.EMPRESA), usuarioController.registrarEmpleado);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   put:
 *     summary: Actualizar un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Usuario actualizado
 */
router.put('/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.MOSTRADOR, PROFILES.EMPRESA, PROFILES.CLIENTE, PROFILES.CHOFER), validateUpdateUsuario, usuarioController.actualizarUsuario);

/**
 * @swagger
 * /api/usuarios/{id}:
 *   delete:
 *     summary: Eliminar un usuario (lógico)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Usuario eliminado
 */
router.delete('/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.EMPRESA), usuarioController.eliminarUsuario);

/**
 * @swagger
 * /api/usuarios/contrasenia/{id}:
 *   put:
 *     summary: Actualizar contraseña
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 */
router.put('/contrasenia/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.MOSTRADOR, PROFILES.EMPRESA, PROFILES.CLIENTE, PROFILES.CHOFER), validateUpdateContrasenia, usuarioController.actualizarContrasenia);

/**
 * @swagger
 * /api/usuarios/choferes/asociados:
 *   get:
 *     summary: Obtener choferes asociados
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 */
router.get('/choferes/asociados', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.MOSTRADOR, PROFILES.EMPRESA), usuarioController.obtenerUsuariosChoferAsociados);

/**
 * @swagger
 * /api/usuarios/choferes/empresa/{id}:
 *   get:
 *     summary: Obtener choferes por empresa
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 */
router.get('/choferes/empresa/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.MOSTRADOR, PROFILES.EMPRESA), usuarioController.obtenerUsuariosChoferPorEmpresa);

// Alias de compatibilidad para app móvil
router.post('/crearUsuario', validateUsuario, usuarioController.crearUsuario);

module.exports = router;
