import { api } from "@/lib/api";
import { edenQueryOptions } from "@/lib/eden-query";
import { unwrapEdenResponse } from "@/lib/eden";
import { animeKeys } from "@/lib/query-keys";

const MINUTE = 60_000;

export async function getHeroCurations() {
  const res = await api.anime["hero-curations"].get();
  return unwrapEdenResponse(res);
}

export const animeQueries = {
  trending: () =>
    edenQueryOptions({
      queryKey: animeKeys.trending(),
      queryFn: () => api.anime.trending.get(),
      staleTime: 5 * MINUTE,
    }),

  heroCurations: () =>
    edenQueryOptions({
      queryKey: animeKeys.heroCurations(),
      queryFn: () => api.anime["hero-curations"].get(),
      staleTime: 10 * MINUTE,
    }),

  search: (query: string) =>
    edenQueryOptions({
      queryKey: animeKeys.search(query),
      queryFn: () => api.anime.search({ query }).get(),
      staleTime: 5 * MINUTE,
    }),

  archiveSearch: (query: string) =>
    edenQueryOptions({
      queryKey: animeKeys.archiveSearch(query),
      queryFn: () => api.anime["archive-search"].get({ query: { q: query, limit: 12 } }),
      staleTime: 1 * MINUTE,
    }),
};

export type HeroCuration = Awaited<ReturnType<typeof getHeroCurations>>[number];
