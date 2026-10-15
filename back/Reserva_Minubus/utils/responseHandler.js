/**
 * Standard API response handler
 * Ensures consistent response format across all endpoints
 */
const { normalize, normalizeResponse } = require('./responseNormalizer');

const sendSuccess = (res, data, message = 'Operación exitosa', status = 200) => {
  return res.status(status).json(normalizeResponse(data, message));
};

const sendError = (res, message = 'Error interno del servidor', status = 500, error = null) => {
  const request = res.req;

  if (status >= 400) {
    const entry = {
      requestId: request?.requestId,
      method: request?.method,
      path: request?.originalUrl,
      status,
      message,
      userId: request?.usuario?.id,
      errorName: error?.name,
      errorMessage: error?.message,
    };

    if (status >= 500) {
      console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', event: 'api_error', ...entry }));
    } else {
      console.warn(JSON.stringify({ timestamp: new Date().toISOString(), level: 'warn', event: 'api_error', ...entry }));
    }
  }

  // Handle AppError instances
  if (error && error.toJSON) {
    return res.status(status).json(error.toJSON());
  }

  return res.status(status).json({
    success: false,
    message,
    code: status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR',
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
