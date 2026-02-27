import { queryOptions } from "@tanstack/react-query";
import { edenFetch } from "./eden-fetch";
import { showSuccessToast, showErrorToast, type ToastKey } from "./toast-messages";

// ---- types to match eden treaty response shapes ----

type EdenQueryFn<TData> = () => Promise<{
  data: TData | null;
  error: { status: number; value: unknown } | null;
}>;

type EdenMutationFn<TInput, TData> = (input: TInput) => Promise<{
  data: TData | null;
  error: { status: number; value: unknown } | null;
}>;

// ---- createQueryOptions ----

export function createQueryOptions<TData>(
  queryKey: readonly unknown[],
  edenFn: EdenQueryFn<TData>,
  opts?: {
    staleTime?: number;
    enabled?: boolean;
  },
) {
  return queryOptions({
    queryKey,
    queryFn: () => edenFetch(edenFn),
    ...opts,
  });
}

// ---- createMutationOptions ----

export function createMutationOptions<TInput, TData = unknown>(
  edenFn: EdenMutationFn<TInput, TData>,
  toastKey?: ToastKey,
  callbacks?: {
    onSuccess?: (data: TData) => void | Promise<void>;
    onError?: (error: unknown) => void;
  },
) {
  return {
    mutationFn: (input: TInput) => edenFetch(() => edenFn(input)),
    ...(toastKey
      ? {
          onSuccess: (data: TData) => {
            showSuccessToast(toastKey);
            callbacks?.onSuccess?.(data);
          },
          onError: (error: unknown) => {
            showErrorToast(toastKey, error);
            callbacks?.onError?.(error);
          },
        }
      : {
          ...(callbacks?.onSuccess ? { onSuccess: callbacks.onSuccess } : {}),
          ...(callbacks?.onError ? { onError: callbacks.onError } : {}),
        }),
  };
}
