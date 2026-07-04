import { type ErrorRequestHandler, type Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { config } from '@/config';
import { AppError } from '@/core/errors';
import { fail } from '@/core/http/api-response';
import { logger } from '@/core/logger/logger';

function isPrismaKnownError(
  error: unknown,
): error is { code: string; meta?: Record<string, unknown> } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    error.code.startsWith('P')
  );
}

function requestLogger(req: Request): typeof logger {
  return (req as Request & { log?: typeof logger }).log ?? logger;
}

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(fail(err.code, err.message, err.details));
    return;
  }

  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));
    res
      .status(StatusCodes.UNPROCESSABLE_ENTITY)
      .json(fail('VALIDATION_ERROR', 'Validation failed', details));
    return;
  }

  if (isPrismaKnownError(err)) {
    if (err.code === 'P2002') {
      res.status(StatusCodes.CONFLICT).json(fail('CONFLICT', 'Resource already exists'));
      return;
    }
    if (err.code === 'P2025') {
      res.status(StatusCodes.NOT_FOUND).json(fail('NOT_FOUND', 'Resource not found'));
      return;
    }
  }

  requestLogger(req).error({ err }, 'Unhandled error');
  const message = config.isProduction ? 'Something went wrong' : String((err as Error)?.message);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(fail('INTERNAL_SERVER_ERROR', message));
};
