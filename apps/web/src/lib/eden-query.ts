import { mutationOptions, queryOptions, type QueryKey } from "@tanstack/react-query";

import { unwrapEdenResponse } from "@/lib/eden";

type EdenError = {
  status: number | string;
  value: unknown;
};

type EdenLikeResponse<TData> = {
  data: TData | null;
  error: EdenError | null;
};

export function edenQueryOptions<TData, TKey extends QueryKey>(input: {
  queryKey: TKey;
  queryFn: () => Promise<EdenLikeResponse<TData>>;
  staleTime?: number;
  gcTime?: number;
}) {
  return queryOptions({
    queryKey: input.queryKey,
    queryFn: async () => unwrapEdenResponse(await input.queryFn()),
    staleTime: input.staleTime,
    gcTime: input.gcTime,
  });
}

export function edenMutationOptions<TData, TVariables = void>(input: {
  mutationFn: (variables: TVariables) => Promise<EdenLikeResponse<TData>>;
}) {
  return mutationOptions<TData, unknown, TVariables>({
    mutationFn: async (variables: TVariables) =>
      unwrapEdenResponse(await input.mutationFn(variables)),
  });
}
