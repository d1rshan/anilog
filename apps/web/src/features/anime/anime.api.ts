import { queryOptions } from "@tanstack/react-query";
import type { ArchiveSearchQuery, AnimeSearchParams, UpsertAnimeBody } from "@anilog/contracts";
import { api } from "@/lib/api";
import { edenFetch } from "@/lib/eden-fetch";
import { animeKeys } from "./anime.keys";

const MINUTE = 60_000;

const animeClient = {
  getTrending: () => edenFetch(() => api.anime.trending.get()),
  getHeroCurations: () => edenFetch(() => api.anime["hero-curations"].get()),
  search: (query: string) => edenFetch(() => api.anime.search({ query }).get()),
  archiveSearch: (query: ArchiveSearchQuery) =>
    edenFetch(() => api.anime["archive-search"].get({ query })),
  upsert: (body: UpsertAnimeBody) => edenFetch(() => api.anime.upsert.post(body)),
};

export const animeQueries = {
  trending: () =>
    queryOptions({
      queryKey: animeKeys.trending(),
      queryFn: animeClient.getTrending,
      staleTime: 5 * MINUTE,
    }),

  heroCurations: () =>
    queryOptions({
      queryKey: animeKeys.heroCurations(),
      queryFn: animeClient.getHeroCurations,
      staleTime: 10 * MINUTE,
    }),

  search: ({ params }: { params: AnimeSearchParams }) =>
    queryOptions({
      queryKey: animeKeys.search(params.query),
      queryFn: () => animeClient.search(params.query),
      staleTime: 5 * MINUTE,
    }),

  archiveSearch: ({ query }: { query: ArchiveSearchQuery }) =>
    queryOptions({
      queryKey: animeKeys.archiveSearch(query.q),
      queryFn: () => animeClient.archiveSearch(query),
      staleTime: 1 * MINUTE,
    }),
};

export const animeMutations = {
  upsertAnime: () => ({
    mutationFn: ({ body }: { body: UpsertAnimeBody }) => animeClient.upsert(body),
  }),
};

export type AnimeSearchInput = { params: AnimeSearchParams };
export type AnimeArchiveSearchInput = { query: ArchiveSearchQuery };
