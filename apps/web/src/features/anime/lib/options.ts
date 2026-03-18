import { api } from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";
import type { AnimeSearchParams, ArchiveSearchQuery, UpsertAnimeBody } from "@anilog/contracts";
import { edenFetch } from "@/lib/eden-fetch";
import { animeKeys } from "@/lib/query-keys";

const MINUTE = 60_000;

export type AnimeSearchInput = {
  params: AnimeSearchParams;
};

export type AnimeArchiveSearchInput = {
  query: ArchiveSearchQuery;
};

export const animeQueries = {
  trending: () =>
    queryOptions({
      queryKey: animeKeys.trending(),
      queryFn: () => edenFetch(() => api.anime.trending.get()),
      staleTime: 5 * MINUTE,
    }),

  heroCurations: () =>
    queryOptions({
      queryKey: animeKeys.heroCurations(),
      queryFn: () => edenFetch(() => api.anime["hero-curations"].get()),
      staleTime: 10 * MINUTE,
    }),

  search: ({ params }: AnimeSearchInput) =>
    queryOptions({
      queryKey: animeKeys.search(params.query),
      queryFn: () => edenFetch(() => api.anime.search({ query: params.query }).get()),
      staleTime: 5 * MINUTE,
    }),

  archiveSearch: ({ query }: AnimeArchiveSearchInput) =>
    queryOptions({
      queryKey: animeKeys.archiveSearch(query.q),
      queryFn: () => edenFetch(() => api.anime["archive-search"].get({ query })),
      staleTime: 1 * MINUTE,
    }),
};

export const animeMutations = {
  upsertAnime: () => ({
    mutationFn: ({ body }: { body: UpsertAnimeBody }) =>
      edenFetch(() => api.anime.upsert.post(body)),
  }),
};

type HeroCurationsData = NonNullable<
  Awaited<ReturnType<(typeof api.anime)["hero-curations"]["get"]>>["data"]
>;
export type HeroCuration = HeroCurationsData[number];
