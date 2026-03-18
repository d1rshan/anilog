import type { ErrorCode, ErrorResponse } from "../schemas/error.schema";

export class ApiError extends Error {
  code: ErrorCode;
  status: number;
  details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, status: number, details?: Record<string, unknown>) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function toErrorResponse(error: ApiError): ErrorResponse {
  return {
    error: {
      code: error.code,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    },
  };
}

export function unauthorizedError(
  message: string = "Unauthorized",
  details?: Record<string, unknown>,
) {
  return new ApiError("UNAUTHORIZED", message, 401, details);
}

export function forbiddenError(message: string = "Forbidden", details?: Record<string, unknown>) {
  return new ApiError("FORBIDDEN", message, 403, details);
}

export function notFoundError(message: string = "Not found", details?: Record<string, unknown>) {
  return new ApiError("NOT_FOUND", message, 404, details);
}

export function validationError(message: string, details?: Record<string, unknown>) {
  return new ApiError("VALIDATION", message, 400, details);
}

export function conflictError(message: string, details?: Record<string, unknown>) {
  return new ApiError("CONFLICT", message, 409, details);
}

export function externalServiceError(message: string, details?: Record<string, unknown>) {
  return new ApiError("EXTERNAL", message, 502, details);
}

export function internalError(
  message: string = "Internal server error",
  details?: Record<string, unknown>,
) {
  return new ApiError("INTERNAL", message, 500, details);
}

export type AppErrorCode = ErrorCode;
export { ApiError as AppError };
