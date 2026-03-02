import { api } from "@/lib/api";
import { createQueryOptions, createMutationOptions } from "@/lib/query-helpers";
import { libraryKeys } from "@/lib/query-keys";

const MINUTE = 60_000;

type LibraryMeRoute = ReturnType<typeof api.library.me>;
type UpdateStatusBody = Parameters<LibraryMeRoute["status"]["patch"]>[0];
type UpdateProgressBody = Parameters<LibraryMeRoute["progress"]["patch"]>[0];
type UpdateRatingBody = Parameters<LibraryMeRoute["rating"]["patch"]>[0];

export const LIBRARY_STATUSES = ["watching", "completed", "watchlist", "dropped"] as const;

export const libraryQueries = {
  myLibrary: () =>
    createQueryOptions(libraryKeys.me(), () => api.library.me.get(), {
      staleTime: 1 * MINUTE,
    }),
};

export type LogAnimeData = Parameters<typeof api.library.me.log.post>[0];
export type UpdateLibraryStatusData = { animeId: number } & UpdateStatusBody;
export type UpdateLibraryProgressData = { animeId: number } & UpdateProgressBody;
export type UpdateLibraryRatingData = { animeId: number } & UpdateRatingBody;

export const libraryMutations = {
  logAnime: () => createMutationOptions((data: LogAnimeData) => api.library.me.log.post(data)),

  updateLibraryStatus: () =>
    createMutationOptions((data: UpdateLibraryStatusData) =>
      api.library.me({ animeId: data.animeId }).status.patch({
        status: data.status,
        currentEpisode: data.currentEpisode,
      }),
    ),

  updateLibraryProgress: () =>
    createMutationOptions((data: UpdateLibraryProgressData) =>
      api.library.me({ animeId: data.animeId }).progress.patch({
        currentEpisode: data.currentEpisode,
        delta: data.delta,
      }),
    ),

  updateLibraryRating: () =>
    createMutationOptions((data: UpdateLibraryRatingData) =>
      api.library.me({ animeId: data.animeId }).rating.patch({
        rating: data.rating,
      }),
    ),

  removeFromLibrary: () =>
    createMutationOptions((animeId: number) => api.library.me({ animeId }).delete()),
};

type MyLibraryData = NonNullable<Awaited<ReturnType<(typeof api.library.me)["get"]>>["data"]>;
export type LibraryEntryWithAnime = MyLibraryData[number];
