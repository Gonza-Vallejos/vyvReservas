/**
 * Standard API response handler
 */
const sendSuccess = (res, data, message = 'Success', status = 200) => {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
};

const sendError = (res, message = 'Internal Server Error', status = 500, error = null) => {
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
    if (status >= 500) console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: 'error', event: 'api_error', ...entry }));
    else console.warn(JSON.stringify({ timestamp: new Date().toISOString(), level: 'warn', event: 'api_error', ...entry }));
  }
  return res.status(status).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};
