const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { autenticarToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación y gestión de cuentas
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - usuario
 *               - contrasenia
 *             properties:
 *               usuario:
 *                 type: string
 *                 example: user113
 *               contrasenia:
 *                 type: string
 *                 example: password.1
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', authController.login);
router.get('/me', autenticarToken, authController.currentSession);
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/auth/verificar/{token}:
 *   get:
 *     summary: Verificar cuenta vía email (Redirige)
 *     tags: [Auth]
 */
router.get('/verificar/:token', authController.verificarEmail);

/**
 * @swagger
 * /api/auth/verificar-final/{token}:
 *   get:
 *     summary: Verificar cuenta vía API
 *     tags: [Auth]
 */
router.get('/verificar-final/:token', authController.verificarFinal);

/**
 * @swagger
 * /api/auth/recuperar-contrasenia:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: usuario113@example.com
 */
router.post('/recuperar-contrasenia', authController.solicitarRecuperacion);

/**
 * @swagger
 * /api/auth/resetear-contrasenia/{token}:
 *   post:
 *     summary: Restablecer contraseña con token
 *     tags: [Auth]
 */
router.post('/resetear-contrasenia/:token', authController.resetearContrasenia);

/**
 * @swagger
 * /api/auth/abrir-app/{token}:
 *   get:
 *     summary: Abrir app para recuperar contraseña
 *     tags: [Auth]
 */
router.get('/abrir-app/:token', authController.abrirApp);

module.exports = router;
