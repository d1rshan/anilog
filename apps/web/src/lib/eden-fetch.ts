export class ApiError extends Error {
  public readonly status: number;
  public readonly value: unknown;

  constructor(status: number, value: unknown) {
    const message =
      typeof value === "object" && value !== null && "error" in value
        ? String((value as { error: string }).error)
        : String(value ?? "API request failed");

    super(message);
    this.name = "ApiError";
    this.status = status;
    this.value = value;
  }
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
