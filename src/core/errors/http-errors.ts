import { StatusCodes } from 'http-status-codes';
import { AppError } from './app-error';

export class BadRequestError extends AppError {
  readonly statusCode = StatusCodes.BAD_REQUEST;
  readonly code = 'BAD_REQUEST';
  constructor(message = 'Bad request', details?: unknown) {
    super(message, details);
  }
}

export class ValidationError extends AppError {
  readonly statusCode = StatusCodes.UNPROCESSABLE_ENTITY;
  readonly code = 'VALIDATION_ERROR';
  constructor(message = 'Validation failed', details?: unknown) {
    super(message, details);
  }
}

export class UnauthorizedError extends AppError {
  readonly statusCode = StatusCodes.UNAUTHORIZED;
  readonly code = 'UNAUTHORIZED';
  constructor(message = 'Authentication required', details?: unknown) {
    super(message, details);
  }
}

export class ForbiddenError extends AppError {
  readonly statusCode = StatusCodes.FORBIDDEN;
  readonly code = 'FORBIDDEN';
  constructor(message = 'You do not have access to this resource', details?: unknown) {
    super(message, details);
  }
}

export class NotFoundError extends AppError {
  readonly statusCode = StatusCodes.NOT_FOUND;
  readonly code = 'NOT_FOUND';
  constructor(message = 'Resource not found', details?: unknown) {
    super(message, details);
  }
}

export class ConflictError extends AppError {
  readonly statusCode = StatusCodes.CONFLICT;
  readonly code = 'CONFLICT';
  constructor(message = 'Resource conflict', details?: unknown) {
    super(message, details);
  }
}

export class TooManyRequestsError extends AppError {
  readonly statusCode = StatusCodes.TOO_MANY_REQUESTS;
  readonly code = 'TOO_MANY_REQUESTS';
  constructor(message = 'Too many requests', details?: unknown) {
    super(message, details);
  }
}

export class InternalServerError extends AppError {
  readonly statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  readonly code = 'INTERNAL_SERVER_ERROR';
  constructor(message = 'Something went wrong', details?: unknown) {
    super(message, details);
  }
}
