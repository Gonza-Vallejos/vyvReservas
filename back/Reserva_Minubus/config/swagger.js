const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Reserva Minubus API',
      version: '1.0.0',
      description: 'Documentación de la API de Reserva de Minubus',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor Local',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Token no proporcionado o inválido',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  mensaje: { type: 'string', example: 'Token no proporcionado' }
                }
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Acceso denegado: perfil no autorizado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', example: false },
                  mensaje: { type: 'string', example: 'Acceso denegado: perfil no autorizado' }
                }
              }
            }
          }
        }
      }
    },
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
