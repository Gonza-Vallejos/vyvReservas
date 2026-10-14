const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const { sendError } = require('./utils/responseHandler');

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
app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// API Routes
app.use('/', indexRouter);
app.use('/api/auth', authRoutes);
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
app.use('/api/pagos', pagosRouter);

// Compatibilidad directa para reservaAPP (rutas que llaman sin prefijo /api)
app.use('/auth', authRoutes);
app.use('/usuarios', usuariosRouter);
app.use('/empresa', empresaRouter);
app.use('/medioTransporte', medioTransporteRouter);
app.use('/medio-transporte', medioTransporteRouter);
app.use('/reserva', reservaRouter);
app.use('/ventas', ventasRouter);
app.use('/viajes', viajesRouter);
app.use('/detalle-venta', detalleVentaRouter);
app.use('/ubicacion', ubicacionRouter);
app.use('/usuarioEmpresa', usuarioEmpresaRouter);
app.use('/usuario-empresa', usuarioEmpresaRouter);
app.use('/reportes', reportesRouter);
app.use('/pagos', pagosRouter);

// 404 Handler
app.use((req, res) => {
  sendError(res, 'Recurso no encontrado', 404);
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
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