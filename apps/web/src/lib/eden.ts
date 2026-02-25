type TreatyError = {
  status: number | string;
  value: unknown;
};

type TreatyLikeResponse<TData, TError = TreatyError> = {
  data: TData | null;
  error: TError | null;
};

export type ApiClientError = unknown;

export class EdenHttpError extends Error {
  readonly status: number | string;
  readonly value: unknown;

  constructor(error: TreatyError) {
    super(extractTreatyErrorMessage(error.value) ?? `API request failed (${String(error.status)})`);
    this.name = "EdenHttpError";
    this.status = error.status;
    this.value = error.value;
  }
}

function isTreatyError(error: unknown): error is TreatyError {
  if (typeof error !== "object" || error == null) {
    return false;
  }

  return "status" in error && "value" in error;
}

function extractTreatyErrorMessage(value: unknown): string | null {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (typeof value === "object" && value != null && "message" in value) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  if (typeof value === "object" && value != null && "error" in value) {
    const error = (value as { error?: unknown }).error;
    if (typeof error === "string" && error.length > 0) {
      return error;
    }
  }

  return null;
}

export function unwrapEdenResponse<TData>(response: TreatyLikeResponse<TData>): NonNullable<TData> {
  if (response.error != null) {
    if (isTreatyError(response.error)) {
      throw new EdenHttpError(response.error);
    }
    throw new Error("API request failed");
  }

  if (response.data == null) {
    throw new Error("API response returned no data");
  }

  return response.data as NonNullable<TData>;
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof EdenHttpError) {
    return error.message;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallback;
}
