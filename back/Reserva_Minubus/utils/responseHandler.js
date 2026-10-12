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
