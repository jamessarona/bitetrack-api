/**
 * Base class for all expected/operational application errors.
 * Operational errors are safe to expose to clients and are distinct from
 * unexpected programmer errors (bugs), which are always masked as 500s.
 */
export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly code: string;
  readonly isOperational = true;
  readonly details?: unknown;

  protected constructor(message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    if (details !== undefined) {
      this.details = details;
    }
    Error.captureStackTrace(this, new.target);
  }
}
