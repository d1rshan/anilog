import { api } from "@/lib/api";
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
import { edenFetch } from "@/lib/eden-fetch";
import { libraryKeys } from "@/lib/query-keys";

const MINUTE = 60_000;

export const LIBRARY_STATUSES: LibraryStatus[] = ["watching", "completed", "watchlist", "dropped"];

export type LogAnimeInput = { body: LogAnimeBody };
export type UpdateLibraryStatusInput = {
  params: LibraryAnimeParams;
  body: UpdateLibraryStatusBody;
};
export type UpdateLibraryProgressInput = {
  params: LibraryAnimeParams;
  body: UpdateLibraryProgressBody;
};
export type UpdateLibraryRatingInput = {
  params: LibraryAnimeParams;
  body: UpdateLibraryRatingBody;
};
export type RemoveFromLibraryInput = { params: LibraryAnimeParams };

export const libraryQueries = {
  myLibrary: () =>
    queryOptions({
      queryKey: libraryKeys.me(),
      queryFn: () => edenFetch(() => api.library.me.get()),
      staleTime: 1 * MINUTE,
    }),
};

export type LogAnimeData = LogAnimeBody;
export type UpdateLibraryStatusData = { animeId: number } & UpdateLibraryStatusBody;
export type UpdateLibraryProgressData = { animeId: number } & UpdateLibraryProgressBody;
export type UpdateLibraryRatingData = { animeId: number } & UpdateLibraryRatingBody;
export type LibraryStatus = LibraryStatusSchema;

export const libraryMutations = {
  logAnime: () => ({
    mutationFn: ({ body }: LogAnimeInput) => edenFetch(() => api.library.me.log.post(body)),
  }),

  updateLibraryStatus: () => ({
    mutationFn: ({ params, body }: UpdateLibraryStatusInput) =>
      edenFetch(() => api.library.me(params).status.patch(body)),
  }),

  updateLibraryProgress: () => ({
    mutationFn: ({ params, body }: UpdateLibraryProgressInput) =>
      edenFetch(() => api.library.me(params).progress.patch(body)),
  }),

  updateLibraryRating: () => ({
    mutationFn: ({ params, body }: UpdateLibraryRatingInput) =>
      edenFetch(() => api.library.me(params).rating.patch(body)),
  }),

  removeFromLibrary: () => ({
    mutationFn: ({ params }: RemoveFromLibraryInput) =>
      edenFetch(() => api.library.me(params).delete()),
  }),
};

export type LibraryEntryWithAnime = LibraryEntryDto;
