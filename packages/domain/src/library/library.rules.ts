import type {
  LogAnimeBody,
  UpdateLibraryStatusBody,
  UpdateLibraryProgressBody,
} from "@anilog/contracts";
import { validationError } from "../shared/errors/api-error";
import type { LibraryEntry } from "./library.types";

function normalizeAnimeStatus(status?: string | null) {
  return (status ?? "").toUpperCase();
}

export function resolveLibraryEpisode(params: {
  status: LogAnimeBody["status"] | UpdateLibraryStatusBody["status"];
  animeEpisodes: number;
  fallbackEpisode: number;
  currentEpisode?: number;
}) {
  const { animeEpisodes, currentEpisode, fallbackEpisode, status } = params;

  if (status === "completed" && animeEpisodes > 0) {
    return animeEpisodes;
  }

  return currentEpisode ?? fallbackEpisode;
}

export function validateLibraryStatusChange(
  entry: Pick<LibraryEntry, "anime" | "currentEpisode">,
  payload: {
    status: LogAnimeBody["status"] | UpdateLibraryStatusBody["status"];
    currentEpisode: number;
  },
) {
  const animeStatus = normalizeAnimeStatus(entry.anime.status);
  const { currentEpisode, status } = payload;

  if (animeStatus === "NOT_YET_RELEASED" && status !== "watchlist") {
    throw validationError("Only Planned is allowed for unreleased anime");
  }

  if (status === "completed" && new Set(["RELEASING", "NOT_YET_RELEASED"]).has(animeStatus)) {
    throw validationError("Cannot mark as Completed until the anime is finished");
  }

  if (status === "watching" && currentEpisode < 1) {
    throw validationError("Current episode is required for Watching");
  }

  if (status === "completed") {
    if (currentEpisode < 1) {
      throw validationError("Current episode is required for Completed");
    }

    if (entry.anime.episodes > 0 && currentEpisode < entry.anime.episodes) {
      throw validationError("Completed anime must have all episodes watched");
    }
  }
}

export function resolveNextProgress(
  existing: Pick<LibraryEntry, "status" | "currentEpisode">,
  payload: UpdateLibraryProgressBody,
) {
  if (payload.currentEpisode === undefined && payload.delta === undefined) {
    throw validationError("Provide currentEpisode or delta for progress update");
  }

  if (existing.status !== "watching") {
    throw validationError("Progress can only be updated for Watching anime");
  }

  const nextEpisodeRaw =
    payload.currentEpisode !== undefined
      ? payload.currentEpisode
      : existing.currentEpisode + (payload.delta ?? 0);

  return Math.max(1, nextEpisodeRaw);
}
