export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "EXTERNAL_SERVICE_ERROR"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  code: ApiErrorCode;
  status: number;
  details?: unknown;

  constructor(code: ApiErrorCode, message: string, status: number, details?: unknown) {
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

export function unauthorizedError(message: string = "Unauthorized", details?: unknown) {
  return new ApiError("UNAUTHORIZED", message, 401, details);
}

export function forbiddenError(message: string = "Forbidden", details?: unknown) {
  return new ApiError("FORBIDDEN", message, 403, details);
}

export function notFoundError(message: string = "Not found", details?: unknown) {
  return new ApiError("NOT_FOUND", message, 404, details);
}

export function validationError(message: string, details?: unknown) {
  return new ApiError("VALIDATION_ERROR", message, 400, details);
}

export function conflictError(message: string, details?: unknown) {
  return new ApiError("CONFLICT", message, 409, details);
}

export function externalServiceError(message: string, details?: unknown) {
  return new ApiError("EXTERNAL_SERVICE_ERROR", message, 502, details);
}

export function internalError(message: string = "Internal server error", details?: unknown) {
  return new ApiError("INTERNAL_ERROR", message, 500, details);
}
