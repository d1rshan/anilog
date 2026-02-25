import { api } from "@/lib/api";
import { unwrapEdenResponse } from "@/lib/eden";
import type {
  LibraryEntryWithAnime,
  LogAnimeInput,
  UpdateProgressInput,
  UpdateRatingInput,
  UpdateStatusInput,
} from "@anilog/api";

export const LIBRARY_STATUSES = ["watching", "completed", "planned", "dropped"] as const;

export type LogAnimeData = LogAnimeInput;

export type UpdateLibraryStatusData = {
  animeId: number;
} & UpdateStatusInput;

export type UpdateLibraryProgressData = {
  animeId: number;
} & UpdateProgressInput;

export type UpdateLibraryRatingData = {
  animeId: number;
} & UpdateRatingInput;

export async function getMyLibrary() {
  const res = await api.library.me.get();
  return unwrapEdenResponse(res);
}

export async function logAnime(data: LogAnimeData) {
  const res = await api.library.me.log.post(data);
  return unwrapEdenResponse(res);
}

export async function updateLibraryStatus(data: UpdateLibraryStatusData) {
  const res = await api.library.me({ animeId: data.animeId }).status.patch({
    status: data.status,
    currentEpisode: data.currentEpisode,
  });

  return unwrapEdenResponse(res);
}

export async function updateLibraryProgress(data: UpdateLibraryProgressData) {
  const res = await api.library.me({ animeId: data.animeId }).progress.patch({
    currentEpisode: data.currentEpisode,
    delta: data.delta,
  });

  return unwrapEdenResponse(res);
}

export async function updateLibraryRating(data: UpdateLibraryRatingData) {
  const res = await api.library.me({ animeId: data.animeId }).rating.patch({
    rating: data.rating,
  });

  return unwrapEdenResponse(res);
}

export async function removeFromLibrary(animeId: number) {
  const res = await api.library.me({ animeId }).delete();
  return unwrapEdenResponse(res);
}

export type { LibraryEntryWithAnime };
