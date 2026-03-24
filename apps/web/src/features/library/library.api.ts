import { queryOptions } from "@tanstack/react-query";
import type {
  LibraryAnimeParams,
  LibraryEntryDto,
  LibraryStatusSchema,
  LogAnimeBody,
  UpdateLibraryProgressBody,
  UpdateLibraryRatingBody,
  UpdateLibraryStatusBody,
} from "@anilog/contracts";
import { api } from "@/lib/api";
import { edenFetch } from "@/lib/eden-fetch";
import { libraryKeys } from "./library.keys";

const MINUTE = 60_000;

const libraryClient = {
  getMine: () => edenFetch(() => api.library.me.get()),
  log: (body: LogAnimeBody) => edenFetch(() => api.library.me.log.post(body)),
  updateStatus: (params: LibraryAnimeParams, body: UpdateLibraryStatusBody) =>
    edenFetch(() => api.library.me(params).status.patch(body)),
  updateProgress: (params: LibraryAnimeParams, body: UpdateLibraryProgressBody) =>
    edenFetch(() => api.library.me(params).progress.patch(body)),
  updateRating: (params: LibraryAnimeParams, body: UpdateLibraryRatingBody) =>
    edenFetch(() => api.library.me(params).rating.patch(body)),
  remove: (params: LibraryAnimeParams) => edenFetch(() => api.library.me(params).delete()),
};

export const LIBRARY_STATUSES: LibraryStatusSchema[] = [
  "watching",
  "completed",
  "watchlist",
  "dropped",
];

export const libraryQueries = {
  myLibrary: () =>
    queryOptions({
      queryKey: libraryKeys.me(),
      queryFn: libraryClient.getMine,
      staleTime: 1 * MINUTE,
    }),
};

export const libraryMutations = {
  logAnime: () => ({
    mutationFn: ({ body }: { body: LogAnimeBody }) => libraryClient.log(body),
  }),
  updateLibraryStatus: () => ({
    mutationFn: ({ params, body }: { params: LibraryAnimeParams; body: UpdateLibraryStatusBody }) =>
      libraryClient.updateStatus(params, body),
  }),
  updateLibraryProgress: () => ({
    mutationFn: ({
      params,
      body,
    }: {
      params: LibraryAnimeParams;
      body: UpdateLibraryProgressBody;
    }) => libraryClient.updateProgress(params, body),
  }),
  updateLibraryRating: () => ({
    mutationFn: ({ params, body }: { params: LibraryAnimeParams; body: UpdateLibraryRatingBody }) =>
      libraryClient.updateRating(params, body),
  }),
  removeFromLibrary: () => ({
    mutationFn: ({ params }: { params: LibraryAnimeParams }) => libraryClient.remove(params),
  }),
};

export type LibraryEntryWithAnime = LibraryEntryDto;
export type LibraryStatus = LibraryStatusSchema;
export type LogAnimeData = LogAnimeBody;
export type UpdateLibraryStatusData = { animeId: number } & UpdateLibraryStatusBody;
export type UpdateLibraryProgressData = { animeId: number } & UpdateLibraryProgressBody;
export type UpdateLibraryRatingData = { animeId: number } & UpdateLibraryRatingBody;
