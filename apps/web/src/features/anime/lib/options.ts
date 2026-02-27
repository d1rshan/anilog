import { api } from "@/lib/api";
import { createQueryOptions, createMutationOptions } from "@/lib/query-helpers";
import { animeKeys } from "@/lib/query-keys";

const MINUTE = 60_000;

export const animeQueries = {
  trending: () =>
    createQueryOptions(animeKeys.trending(), () => api.anime.trending.get(), {
      staleTime: 5 * MINUTE,
    }),

  heroCurations: () =>
    createQueryOptions(animeKeys.heroCurations(), () => api.anime["hero-curations"].get(), {
      staleTime: 10 * MINUTE,
    }),

  search: (query: string) =>
    createQueryOptions(animeKeys.search(query), () => api.anime.search({ query }).get(), {
      staleTime: 5 * MINUTE,
    }),

  archiveSearch: (query: string) =>
    createQueryOptions(
      animeKeys.archiveSearch(query),
      () => api.anime["archive-search"].get({ query: { q: query, limit: 12 } }),
      { staleTime: 1 * MINUTE },
    ),
};

export const animeMutations = {
  upsertAnime: () =>
    createMutationOptions(
      (animeData: Parameters<typeof api.anime.upsert.post>[0]) => api.anime.upsert.post(animeData),
      "anime.upsert",
    ),
};

type HeroCurationsData = NonNullable<
  Awaited<ReturnType<(typeof api.anime)["hero-curations"]["get"]>>["data"]
>;
export type HeroCuration = HeroCurationsData[number];
