import { api } from "@/lib/api";
import { edenMutationOptions } from "@/lib/eden-query";

type LibraryMeRoute = ReturnType<typeof api.library.me>;
type UpdateStatusBody = Parameters<LibraryMeRoute["status"]["patch"]>[0];
type UpdateProgressBody = Parameters<LibraryMeRoute["progress"]["patch"]>[0];
type UpdateRatingBody = Parameters<LibraryMeRoute["rating"]["patch"]>[0];

export type LogAnimeData = Parameters<typeof api.library.me.log.post>[0];
export type UpdateLibraryStatusData = { animeId: number } & UpdateStatusBody;
export type UpdateLibraryProgressData = { animeId: number } & UpdateProgressBody;
export type UpdateLibraryRatingData = { animeId: number } & UpdateRatingBody;

export const libraryMutations = {
  logAnime: () =>
    edenMutationOptions({
      mutationFn: (data: LogAnimeData) => api.library.me.log.post(data),
    }),

  updateLibraryStatus: () =>
    edenMutationOptions({
      mutationFn: (data: UpdateLibraryStatusData) =>
        api.library.me({ animeId: data.animeId }).status.patch({
          status: data.status,
          currentEpisode: data.currentEpisode,
        }),
    }),

  updateLibraryProgress: () =>
    edenMutationOptions({
      mutationFn: (data: UpdateLibraryProgressData) =>
        api.library.me({ animeId: data.animeId }).progress.patch({
          currentEpisode: data.currentEpisode,
          delta: data.delta,
        }),
    }),

  updateLibraryRating: () =>
    edenMutationOptions({
      mutationFn: (data: UpdateLibraryRatingData) =>
        api.library.me({ animeId: data.animeId }).rating.patch({
          rating: data.rating,
        }),
    }),

  removeFromLibrary: () =>
    edenMutationOptions({
      mutationFn: (animeId: number) => api.library.me({ animeId }).delete(),
    }),
};
