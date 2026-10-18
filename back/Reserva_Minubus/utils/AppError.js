/**
 * Custom error classes for the application
 * Provides better error tracking and classification
 */

class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = this.constructor.name;
    this.status = status;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      status: this.status
    };
  }
}

class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      details: this.details
    };
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'No autenticado') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'No autorizado') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} no encontrado`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Conflicto de datos', code = 'CONFLICT', details = null) {
    super(message, 409, code);
    this.details = details;
  }
}

class SeatAlreadyTakenError extends ConflictError {
  constructor(message = 'El asiento seleccionado ya fue reservado por otro usuario', asientosEnConflicto = []) {
    super(message, 'SEAT_ALREADY_TAKEN', { asientosEnConflicto });
    this.name = 'SeatAlreadyTakenError';
    this.asientosEnConflicto = asientosEnConflicto;
  }
}

class NoAvailabilityError extends AppError {
  constructor(message = 'No hay disponibilidad') {
    super(message, 422, 'NO_AVAILABILITY');
  }
}

class ExternalServiceError extends AppError {
  constructor(service = 'Servicio externo') {
    super(`Error en ${service}`, 502, 'EXTERNAL_SERVICE_ERROR');
  }
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  SeatAlreadyTakenError,
  NoAvailabilityError,
  ExternalServiceError
};
