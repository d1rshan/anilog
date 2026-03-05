import { api } from "@/lib/api";
import type { AnimeSearchParams, ArchiveSearchQuery, UpsertAnimeBody } from "@anilog/api";
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

  search: ({ params }: { params: AnimeSearchParams }) =>
    createQueryOptions(
      animeKeys.search(params.query),
      () => api.anime.search({ query: params.query }).get(),
      {
        staleTime: 5 * MINUTE,
      },
    ),

  archiveSearch: ({ query }: { query: ArchiveSearchQuery }) =>
    createQueryOptions(
      animeKeys.archiveSearch(query.q),
      () => api.anime["archive-search"].get({ query }),
      { staleTime: 1 * MINUTE },
    ),
};

export const animeMutations = {
  upsertAnime: () =>
    createMutationOptions(
      ({ body }: { body: UpsertAnimeBody }) => api.anime.upsert.post(body),
      "anime.upsert",
    ),
};

type HeroCurationsData = NonNullable<
  Awaited<ReturnType<(typeof api.anime)["hero-curations"]["get"]>>["data"]
>;
export type HeroCuration = HeroCurationsData[number];
