import { api } from "@/lib/api";
import { unwrapEdenResponse } from "@/lib/eden";

export const LIBRARY_STATUSES = ["watching", "completed", "planned", "dropped"] as const;

type LibraryMeRoute = ReturnType<typeof api.library.me>;
type UpdateStatusBody = Parameters<LibraryMeRoute["status"]["patch"]>[0];
type UpdateProgressBody = Parameters<LibraryMeRoute["progress"]["patch"]>[0];
type UpdateRatingBody = Parameters<LibraryMeRoute["rating"]["patch"]>[0];

export type LogAnimeData = Parameters<typeof api.library.me.log.post>[0];
export type UpdateLibraryStatusData = { animeId: number } & UpdateStatusBody;
export type UpdateLibraryProgressData = { animeId: number } & UpdateProgressBody;
export type UpdateLibraryRatingData = { animeId: number } & UpdateRatingBody;

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

export type LibraryEntryWithAnime = Awaited<ReturnType<typeof getMyLibrary>>[number];
