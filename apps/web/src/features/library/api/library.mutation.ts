import type {
  LibraryAnimeParams,
  LogAnimeBody,
  UpdateLibraryProgressBody,
  UpdateLibraryRatingBody,
  UpdateLibraryStatusBody,
} from "@anilog/contracts";
import { libraryClient } from "./library.client";

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

export type LogAnimeData = LogAnimeBody;
export type UpdateLibraryStatusData = { animeId: number } & UpdateLibraryStatusBody;
export type UpdateLibraryProgressData = { animeId: number } & UpdateLibraryProgressBody;
export type UpdateLibraryRatingData = { animeId: number } & UpdateLibraryRatingBody;

export const libraryMutations = {
  logAnime: () => ({
    mutationFn: ({ body }: LogAnimeInput) => libraryClient.log(body),
  }),
  updateLibraryStatus: () => ({
    mutationFn: ({ params, body }: UpdateLibraryStatusInput) =>
      libraryClient.updateStatus(params, body),
  }),
  updateLibraryProgress: () => ({
    mutationFn: ({ params, body }: UpdateLibraryProgressInput) =>
      libraryClient.updateProgress(params, body),
  }),
  updateLibraryRating: () => ({
    mutationFn: ({ params, body }: UpdateLibraryRatingInput) =>
      libraryClient.updateRating(params, body),
  }),
  removeFromLibrary: () => ({
    mutationFn: ({ params }: RemoveFromLibraryInput) => libraryClient.remove(params),
  }),
};
