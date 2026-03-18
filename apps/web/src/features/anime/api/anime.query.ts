import { queryOptions } from "@tanstack/react-query";
import type { AnimeSearchParams, ArchiveSearchQuery, HeroCurationDto } from "@anilog/contracts";
import { animeClient } from "./anime.client";
import { animeKeys } from "./anime.keys";

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
      queryFn: animeClient.getTrending,
      staleTime: 5 * MINUTE,
    }),

  heroCurations: () =>
    queryOptions({
      queryKey: animeKeys.heroCurations(),
      queryFn: animeClient.getHeroCurations,
      staleTime: 10 * MINUTE,
    }),

  search: ({ params }: AnimeSearchInput) =>
    queryOptions({
      queryKey: animeKeys.search(params.query),
      queryFn: () => animeClient.search(params.query),
      staleTime: 5 * MINUTE,
    }),

  archiveSearch: ({ query }: AnimeArchiveSearchInput) =>
    queryOptions({
      queryKey: animeKeys.archiveSearch(query.q),
      queryFn: () => animeClient.archiveSearch(query),
      staleTime: 1 * MINUTE,
    }),
};

export type HeroCuration = HeroCurationDto;
