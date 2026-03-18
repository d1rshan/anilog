import type { ErrorCode, ErrorResponse } from "@anilog/contracts";

export class ApiError extends Error {
  public readonly status: number;
  public readonly value: unknown;
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(status: number, value: unknown) {
    const parsed = parseErrorResponse(value);
    const message = parsed?.error.message ?? String(value ?? "API request failed");

    super(message);
    this.name = "ApiError";
    this.status = status;
    this.value = value;
    this.code = parsed?.error.code ?? "INTERNAL";
    this.details = parsed?.error.details;
  }
}

export function parseErrorResponse(value: unknown): ErrorResponse | null {
  if (typeof value !== "object" || value === null || !("error" in value)) {
    return null;
  }

  const error = (value as { error?: unknown }).error;
  if (typeof error !== "object" || error === null) {
    return null;
  }

  const code = (error as { code?: unknown }).code;
  const message = (error as { message?: unknown }).message;
  const details = (error as { details?: unknown }).details;

  if (typeof code !== "string" || typeof message !== "string") {
    return null;
  }

  return {
    error: {
      code: code as ErrorCode,
      message,
      ...(typeof details === "object" && details !== null
        ? { details: details as Record<string, unknown> }
        : {}),
    },
  };
}

export function getApiErrorMessage(error: unknown): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  const parsed = parseErrorResponse(error);
  if (parsed) {
    return parsed.error.message;
  }

  return "Something went wrong";
}

/**
 * Unwraps an Eden Treaty response, returning the data or throwing an `ApiError`.
 *
 * Usage:
 * ```ts
 * const data = await edenFetch(() => api.anime.trending.get());
 * ```
 */
export async function edenFetch<T>(
  call: () => Promise<{
    data: T | null;
    error: { status: number; value: unknown } | null;
  }>,
): Promise<T> {
  const { data, error } = await call();

  if (error) {
    throw new ApiError(error.status, error.value);
  }

  return data as T;
}
