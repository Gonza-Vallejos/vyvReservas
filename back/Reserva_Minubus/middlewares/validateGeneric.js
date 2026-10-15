/**
 * Generic validation middleware factory
 * Creates validation middleware based on schema definition
 */
const { validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHandler');

/**
 * Creates a validation middleware from an array of express-validator validations
 */
const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return sendError(res, 'Error de validación', 400, {
      name: 'ValidationError',
      message: 'Error de validación',
      errors: extractedErrors
    });
  };
};

/**
 * Common validation schemas
 */
const schemas = {
  id: {
    in: ['params'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'ID debe ser un número entero positivo'
    }
  },
  empresaId: {
    in: ['params'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'ID de empresa debe ser un número entero positivo'
    }
  },
  usuarioId: {
    in: ['body'],
    isInt: {
      options: { min: 1 },
      errorMessage: 'ID de usuario debe ser un número entero positivo'
    }
  }
};

module.exports = {
  validate,
  schemas
};
