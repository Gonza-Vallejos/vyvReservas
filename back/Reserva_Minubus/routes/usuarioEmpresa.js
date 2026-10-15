const express = require('express');
const router = express.Router();
const usuarioEmpresa = require('../controllers/usuarioEmpresaController');
const { autenticarToken, permitirPerfiles, PROFILES } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: UsuarioEmpresa
 *   description: Relación entre usuarios y empresas
 */

/**
 * @swagger
 * /api/usuario-empresa/asociar/{id}/{empresaId}:
 *   post:
 *     summary: Asociar un usuario a una empresa
 *     tags: [UsuarioEmpresa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del Usuario
 *       - in: path
 *         name: empresaId
 *         required: true
 *         description: ID de la Empresa
 */
router.post('/asociar/:id/:empresaId', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.MOSTRADOR, PROFILES.EMPRESA), usuarioEmpresa.asociarUsuarioEmpresa);

/**
 * @swagger
 * /api/usuario-empresa/usuario/{id}:
 *   get:
 *     summary: Obtener empresa de un usuario
 *     tags: [UsuarioEmpresa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/usuario/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.MOSTRADOR, PROFILES.EMPRESA), usuarioEmpresa.obtenerEmpresaDeUsuario);

/**
 * @swagger
 * /api/usuario-empresa/desasociar/{id}:
 *   delete:
 *     summary: Desasociar un usuario de su empresa
 *     tags: [UsuarioEmpresa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.delete('/desasociar/:id', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR), usuarioEmpresa.desasociarUsuarioEmpresa);

/**
 * @swagger
 * /api/usuario-empresa/empresa/{id}/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios de una empresa
 *     tags: [UsuarioEmpresa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 */
router.get('/empresa/:id/usuarios', autenticarToken, permitirPerfiles(PROFILES.ADMINISTRADOR, PROFILES.MOSTRADOR, PROFILES.EMPRESA), usuarioEmpresa.obtenerUsuariosPorEmpresa);

module.exports = router;