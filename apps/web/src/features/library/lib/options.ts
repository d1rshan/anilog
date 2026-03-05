import { api } from "@/lib/api";
import type {
  LibraryAnimeParams,
  LogAnimeBody,
  UpdateLibraryProgressBody,
  UpdateLibraryRatingBody,
  UpdateLibraryStatusBody,
} from "@anilog/api";
import { createQueryOptions, createMutationOptions } from "@/lib/query-helpers";
import { libraryKeys } from "@/lib/query-keys";

const MINUTE = 60_000;

export const LIBRARY_STATUSES = ["watching", "completed", "watchlist", "dropped"] as const;

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

export const libraryMutations = {
  logAnime: () =>
    createMutationOptions(({ body }: { body: LogAnimeBody }) => api.library.me.log.post(body)),

  updateLibraryStatus: () =>
    createMutationOptions(
      ({ params, body }: { params: LibraryAnimeParams; body: UpdateLibraryStatusBody }) =>
        api.library.me(params).status.patch(body),
    ),

  updateLibraryProgress: () =>
    createMutationOptions(
      ({ params, body }: { params: LibraryAnimeParams; body: UpdateLibraryProgressBody }) =>
        api.library.me(params).progress.patch(body),
    ),

  updateLibraryRating: () =>
    createMutationOptions(
      ({ params, body }: { params: LibraryAnimeParams; body: UpdateLibraryRatingBody }) =>
        api.library.me(params).rating.patch(body),
    ),

  removeFromLibrary: () =>
    createMutationOptions(({ params }: { params: LibraryAnimeParams }) =>
      api.library.me(params).delete(),
    ),
};

type MyLibraryData = NonNullable<Awaited<ReturnType<(typeof api.library.me)["get"]>>["data"]>;
export type LibraryEntryWithAnime = MyLibraryData[number];
