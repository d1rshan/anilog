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

  constructor(code: ApiErrorCode, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function unauthorizedError(message: string = "Unauthorized") {
  return new ApiError("UNAUTHORIZED", message, 401);
}

export function forbiddenError(message: string = "Forbidden") {
  return new ApiError("FORBIDDEN", message, 403);
}

export function notFoundError(message: string = "Not found") {
  return new ApiError("NOT_FOUND", message, 404);
}

export function validationError(message: string) {
  return new ApiError("VALIDATION_ERROR", message, 400);
}

export function conflictError(message: string) {
  return new ApiError("CONFLICT", message, 409);
}

export function externalServiceError(message: string) {
  return new ApiError("EXTERNAL_SERVICE_ERROR", message, 502);
}

export function internalError(message: string = "Internal server error") {
  return new ApiError("INTERNAL_ERROR", message, 500);
}
