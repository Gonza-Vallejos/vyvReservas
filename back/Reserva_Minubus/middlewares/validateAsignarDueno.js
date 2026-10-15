/**
 * Validation middleware for asignarDueno endpoint
 */
const { body, param } = require('express-validator');
const { validate } = require('./validateGeneric');

const rules = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de empresa debe ser un número entero positivo')
    .toInt(),
  
  body('usuarioId')
    .isInt({ min: 1 })
    .withMessage('usuarioId debe ser un número entero positivo')
    .toInt()
];

module.exports = validate(rules);
