import {
  LIBRARY_STATUSES,
  type LibraryEntryWithAnime,
  type LibraryStatus,
  type LogAnimeData,
} from "./library.api";
import type { UpdateLibraryProgressBody } from "@anilog/contracts";

export type MutationContext = {
  previous?: LibraryEntryWithAnime[];
  currentUserId?: string;
};

export function groupLibraryByStatus(
  entries: LibraryEntryWithAnime[] | undefined,
): Record<LibraryStatus, LibraryEntryWithAnime[]> {
  const grouped: Record<LibraryStatus, LibraryEntryWithAnime[]> = {
    watching: [],
    completed: [],
    watchlist: [],
    dropped: [],
  };

  for (const entry of entries ?? []) {
    grouped[entry.status].push(entry);
  }

  return grouped;
}

export function buildLogPayload(
  anime: LogAnimeData["anime"],
  status: LibraryStatus,
  currentEpisode?: number,
  rating?: number | null,
): LogAnimeData {
  return {
    anime,
    status,
    currentEpisode,
    rating,
  };
}

export function createOptimisticLibraryEntry(body: LogAnimeData): LibraryEntryWithAnime {
  return {
    id: `optimistic-${body.anime.id}`,
    userId: "",
    animeId: body.anime.id,
    status: body.status,
    currentEpisode: Math.max(0, body.currentEpisode ?? 0),
    rating: body.rating ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
    anime: {
      id: body.anime.id,
      title: body.anime.title,
      titleJapanese: body.anime.titleJapanese,
      imageUrl: body.anime.imageUrl,
      year: body.anime.year,
      episodes: body.anime.episodes,
      status: body.anime.status,
      genres: body.anime.genres,
      rating: body.anime.rating,
    },
  };
}

export function getOptimisticProgressEntry(
  entries: LibraryEntryWithAnime[],
  animeId: number,
  body: UpdateLibraryProgressBody,
) {
  const target = entries.find((entry) => entry.animeId === animeId);
  if (!target) {
    return null;
  }

  return {
    ...target,
    currentEpisode:
      body.currentEpisode !== undefined
        ? body.currentEpisode
        : Math.max(1, target.currentEpisode + (body.delta ?? 0)),
    updatedAt: new Date(),
  };
}

export function getEntryByAnimeId(entries: LibraryEntryWithAnime[] | undefined, animeId: number) {
  return entries?.find((entry) => entry.animeId === animeId) ?? null;
}

export function getEntryTitle(entries: LibraryEntryWithAnime[] | undefined, animeId: number) {
  return getEntryByAnimeId(entries, animeId)?.anime.title;
}

export function getNextEpisode(currentEpisode: number): number {
  return Math.max(1, currentEpisode + 1);
}

export { LIBRARY_STATUSES };
