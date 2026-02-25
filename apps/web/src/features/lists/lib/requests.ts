import { api } from "@/lib/api";
import type { Anime, LibraryStatus, UserAnime } from "@anilog/db/schema/anilog";

export const LIBRARY_STATUSES = ["watching", "completed", "planned", "dropped"] as const;

export type LibraryEntryWithAnime = UserAnime & {
  anime: Pick<
    Anime,
    "id" | "title" | "titleJapanese" | "imageUrl" | "year" | "episodes" | "status"
  >;
};

export type LogAnimeData = {
  anime: Pick<
    Anime,
    | "id"
    | "title"
    | "titleJapanese"
    | "description"
    | "episodes"
    | "status"
    | "genres"
    | "imageUrl"
    | "year"
    | "rating"
  >;
  status: LibraryStatus;
  currentEpisode?: number;
  rating?: number | null;
};

export type UpdateLibraryStatusData = {
  animeId: number;
  status: LibraryStatus;
  currentEpisode?: number;
};

export type UpdateLibraryProgressData = {
  animeId: number;
  currentEpisode?: number;
  delta?: number;
};

export type UpdateLibraryRatingData = {
  animeId: number;
  rating: number | null;
};

export async function getMyLibrary(): Promise<LibraryEntryWithAnime[]> {
  const res = await api.library.me.get();

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function logAnime(data: LogAnimeData): Promise<LibraryEntryWithAnime> {
  const res = await api.library.me.log.post(data);

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function updateLibraryStatus(
  data: UpdateLibraryStatusData,
): Promise<LibraryEntryWithAnime> {
  const res = await api.library.me({ animeId: data.animeId }).status.patch({
    status: data.status,
    currentEpisode: data.currentEpisode,
  });

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function updateLibraryProgress(
  data: UpdateLibraryProgressData,
): Promise<LibraryEntryWithAnime> {
  const res = await api.library.me({ animeId: data.animeId }).progress.patch({
    currentEpisode: data.currentEpisode,
    delta: data.delta,
  });

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function updateLibraryRating(
  data: UpdateLibraryRatingData,
): Promise<LibraryEntryWithAnime> {
  const res = await api.library.me({ animeId: data.animeId }).rating.patch({
    rating: data.rating,
  });

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function removeFromLibrary(animeId: number): Promise<boolean> {
  const res = await api.library.me({ animeId }).delete();

  if (res.error) {
    throw res.error;
  }

  return res.data;
}
