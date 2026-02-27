import { api } from "@/lib/api";
import { edenQueryOptions } from "@/lib/eden-query";
import { unwrapEdenResponse } from "@/lib/eden";
import { adminKeys } from "@/lib/query-keys";

const SECOND = 1000;

export async function getAdminHeroCurations() {
  const res = await api.admin["hero-curations"].get();
  return unwrapEdenResponse(res);
}

export const adminQueries = {
  stats: () =>
    edenQueryOptions({
      queryKey: adminKeys.stats(),
      queryFn: () => api.admin.stats.get(),
      staleTime: 30 * SECOND,
    }),

  users: (query: string, limit: number, offset: number) =>
    edenQueryOptions({
      queryKey: adminKeys.users(query, limit, offset),
      queryFn: () =>
        api.admin.users.get({
          query: {
            q: query,
            limit,
            offset,
          },
        }),
      staleTime: 30 * SECOND,
    }),

  heroCurations: () =>
    edenQueryOptions({
      queryKey: adminKeys.heroCurations(),
      queryFn: () => api.admin["hero-curations"].get(),
      staleTime: 30 * SECOND,
    }),
};

export type AdminHeroCuration = Awaited<ReturnType<typeof getAdminHeroCurations>>[number];
