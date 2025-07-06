import { Request, Response, NextFunction } from 'express';
import { ValidationError as SequelizeValidationError, UniqueConstraintError } from 'sequelize';
import { log } from '../utils/logger';
import { AppError } from '../utils/errors';

/**
 * Global error handling middleware
 * Handles different types of errors and returns appropriate responses
 */
const errorHandler = (
  err: Error | SequelizeValidationError | UniqueConstraintError | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError && err.isOperational) {
    log.warn('Operational error occurred', {
      message: err.message,
      statusCode: err.statusCode,
      stack: err.stack,
    });
  } else {
    log.error('Unexpected error occurred', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
  }

  // Handle custom AppError instances
  if (err instanceof AppError) {
    const response: any = {
      success: false,
      message: err.message,
    };

    if (err.errors && err.errors.length > 0) {
      response.errors = err.errors;
    }

    res.status(err.statusCode).json(response);
    return;
  }

  // Sequelize validation errors
  if (err instanceof SequelizeValidationError) {
    log.warn('Sequelize validation error', {
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });

    res.status(400).json({
      success: false,
      message: 'Validation error occurred',
      errors: err.errors.map((e) => ({
        field: e.path || 'unknown',
        message: e.message,
      })),
    });
    return;
  }

  // Sequelize unique constraint errors
  if (err instanceof UniqueConstraintError) {
    log.warn('Sequelize unique constraint error', {
      errors: err.errors.map((e) => ({ field: e.path, message: e.message })),
    });

    res.status(409).json({
      success: false,
      message: 'Resource already exists',
      errors: err.errors.map((e) => ({
        field: e.path || 'unknown',
        message: e.message,
      })),
    });
    return;
  }

  // Default error
  const status = (err as any).status || 500;
  const isOperational = err instanceof AppError ? err.isOperational : false;

  res.status(status).json({
    success: false,
    message: isOperational ? err.message : 'An unexpected error occurred. Please try again later.',
  });
};

export default errorHandler;
