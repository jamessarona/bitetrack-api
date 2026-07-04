export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function ok<T>(data: T, meta?: Record<string, unknown>): SuccessResponse<T> {
  return meta ? { success: true, data, meta } : { success: true, data };
}

export function fail(code: string, message: string, details?: unknown): ErrorResponse {
  return {
    success: false,
    error: details !== undefined ? { code, message, details } : { code, message },
  };
}
