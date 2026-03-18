import { api } from "@/lib/api";
import type {
  LibraryAnimeParams,
  LibraryEntryDto,
  LibraryStatusSchema,
  LogAnimeBody,
  UpdateLibraryProgressBody,
  UpdateLibraryRatingBody,
  UpdateLibraryStatusBody,
} from "@anilog/contracts";
import { createQueryOptions, createMutationOptions } from "@/lib/query-helpers";
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
    createQueryOptions(libraryKeys.me(), () => api.library.me.get(), {
      staleTime: 1 * MINUTE,
    }),
};

export type LogAnimeData = LogAnimeBody;
export type UpdateLibraryStatusData = { animeId: number } & UpdateLibraryStatusBody;
export type UpdateLibraryProgressData = { animeId: number } & UpdateLibraryProgressBody;
export type UpdateLibraryRatingData = { animeId: number } & UpdateLibraryRatingBody;
export type LibraryStatus = LibraryStatusSchema;

export const libraryMutations = {
  logAnime: () =>
    createMutationOptions(
      ({ body }: LogAnimeInput) => api.library.me.log.post(body),
      "library.log",
      {
        getSuccessToastContext: ({ data, input }) => ({
          animeTitle: data.anime.title,
          status: input.body.status,
          wasNewEntry: input.body.status === "watchlist",
        }),
      },
    ),

  updateLibraryStatus: () =>
    createMutationOptions(
      ({ params, body }: UpdateLibraryStatusInput) => api.library.me(params).status.patch(body),
      "library.status.update",
      {
        getSuccessToastContext: ({ data }) => ({
          animeTitle: data.anime.title,
        }),
      },
    ),

  updateLibraryProgress: () =>
    createMutationOptions(
      ({ params, body }: UpdateLibraryProgressInput) => api.library.me(params).progress.patch(body),
      "library.progress.update",
      {
        getSuccessToastContext: ({ data }) => ({
          animeTitle: data.anime.title,
        }),
      },
    ),

  updateLibraryRating: () =>
    createMutationOptions(
      ({ params, body }: UpdateLibraryRatingInput) => api.library.me(params).rating.patch(body),
      "library.rating.update",
      {
        getSuccessToastContext: ({ data }) => ({
          animeTitle: data.anime.title,
        }),
      },
    ),

  removeFromLibrary: () =>
    createMutationOptions(
      ({ params }: RemoveFromLibraryInput) => api.library.me(params).delete(),
      "library.remove",
    ),
};

export type LibraryEntryWithAnime = LibraryEntryDto;
