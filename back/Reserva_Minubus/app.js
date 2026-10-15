const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { sendError } = require('./utils/responseHandler');
const { randomUUID } = require('crypto');
const appLogger = require('./utils/logger');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

// Routers
const indexRouter = require('./routes/index');
const authRoutes = require('./routes/auth');
const usuariosRouter = require('./routes/usuario');
const empresaRouter = require('./routes/empresa');
const medioTransporteRouter = require('./routes/medioTransporte');
const reservaRouter = require('./routes/reserva');
const ventasRouter = require('./routes/ventas');
const viajesRouter = require('./routes/viajes');
const detalleVentaRouter = require('./routes/detalleVenta');
const ubicacionRouter = require('./routes/ubicacion');
const usuarioEmpresaRouter = require('./routes/usuarioEmpresa');
const reportesRouter = require('./routes/reportes');
const pagosRouter = require('./routes/pagos');

const app = express();

// Database Connection
const db = require('./models');
db.sequelize.authenticate()
  .then(() => console.log('✅ Conexión a la base de datos exitosa'))
  .catch((error) => console.error('❌ Error al conectar con la base de datos:', error));

// Middlewares
// Rate limiting general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por ventana
  message: { success: false, message: 'Demasiadas solicitudes, intenta más tarde', code: 'RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para auth (más estricto)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 intentos de login por ventana
  message: { success: false, message: 'Demasiados intentos de login', code: 'AUTH_RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para pagos
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 20, // 20 requests por minuto
  message: { success: false, message: 'Demasiadas solicitudes de pago', code: 'PAYMENT_RATE_LIMITED' },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configurado
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*', // Configurar en .env para producción
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));

app.use(generalLimiter);
app.use(logger('dev'));
app.use((req, res, next) => {
  req.requestId = randomUUID();
  const startedAt = Date.now();

  res.on('finish', () => {
    appLogger.info('http_request', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
      userId: req.usuario?.id,
      perfil: req.usuario?.perfil,
    });
  });

  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// API Routes
app.use('/', indexRouter);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/empresa', empresaRouter);
app.use('/api/medio-transporte', medioTransporteRouter);
app.use('/api/reserva', reservaRouter);
app.use('/api/ventas', ventasRouter);
app.use('/api/viajes', viajesRouter);
app.use('/api/detalle-venta', detalleVentaRouter);
app.use('/api/ubicacion', ubicacionRouter);
app.use('/api/usuario-empresa', usuarioEmpresaRouter);
app.use('/api/reportes', reportesRouter);
app.use('/api/pagos', paymentLimiter, pagosRouter);

// Deprecated: rutas sin prefijo /api (solo para backwards compatibility con app móvil)
// Si la app móvil se actualiza, eliminar estas líneas
app.use('/auth', authLimiter, authRoutes);
app.use('/viajes', viajesRouter);
app.use('/reserva', reservaRouter);
app.use('/ubicacion', ubicacionRouter);

// 404 Handler
app.use((req, res) => {
  appLogger.warn('route_not_found', {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
  });
  sendError(res, 'Recurso no encontrado', 404);
});

// Global Error Handler
app.use((err, req, res, next) => {
  appLogger.error('unhandled_error', {
    requestId: req.requestId,
    ...appLogger.errorDetails(err),
  });
  sendError(res, err.message || 'Error interno del servidor', err.status || 500, err);
});

// Server Configuration
const port = process.env.PORT || '3000';
app.set('port', port);

const server = app.listen(port, () => {
  console.log(`🚀 Server is listening on port ${port}`);
  console.log(`📄 Swagger documentation available at http://localhost:${port}/api-docs`);
});

// Server Error Handling
server.on('error', (error) => {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requiere privilegios elevados`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`${bind} ya está en uso`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});
