import type {
  LibraryEntryDto,
  LogAnimeBody,
  UpdateLibraryProgressBody,
  UpdateLibraryRatingBody,
  UpdateLibraryStatusBody,
} from "@anilog/contracts";
import { LibraryRepository, type LibraryEntryRecord } from "@anilog/db/repositories/library.repo";
import { internalError, notFoundError } from "../shared/errors/api-error";
import {
  resolveLibraryEpisode,
  resolveNextProgress,
  validateLibraryStatusChange,
} from "./library.rules";

export class LibraryService {
  static async getUserLibrary(userId: string): Promise<LibraryEntryDto[]> {
    const rows = await LibraryRepository.findUserLibrary(userId);
    return rows.map(this.toLibraryEntryDto);
  }

  private static toLibraryEntryDto(entry: LibraryEntryRecord): LibraryEntryDto {
    return entry;
  }

  private static async getLibraryEntry(
    userId: string,
    animeId: number,
  ): Promise<LibraryEntryDto | null> {
    const entry = await LibraryRepository.findLibraryEntry(userId, animeId);
    return entry ? this.toLibraryEntryDto(entry) : null;
  }

  static async logAnime(userId: string, input: LogAnimeBody): Promise<LibraryEntryDto> {
    await LibraryRepository.upsertAnime(input.anime);

    const resolvedEpisode = Math.max(
      0,
      resolveLibraryEpisode({
        status: input.status,
        animeEpisodes: input.anime.episodes,
        fallbackEpisode: 0,
        currentEpisode: input.currentEpisode,
      }),
    );

    validateLibraryStatusChange(
      {
        anime: input.anime,
        currentEpisode: resolvedEpisode,
      },
      {
        status: input.status,
        currentEpisode: resolvedEpisode,
      },
    );

    await LibraryRepository.upsertLibraryEntry({
      userId,
      animeId: input.anime.id,
      status: input.status,
      currentEpisode: resolvedEpisode,
      rating: input.rating ?? null,
    });

    const entry = await this.getLibraryEntry(userId, input.anime.id);

    if (!entry) {
      throw internalError("Failed to log anime");
    }

    return entry;
  }

  static async updateStatus(
    userId: string,
    animeId: number,
    payload: UpdateLibraryStatusBody,
  ): Promise<LibraryEntryDto> {
    const { currentEpisode, status } = payload;
    const existing = await this.getLibraryEntry(userId, animeId);
    if (!existing) {
      throw notFoundError("Anime not found in your library");
    }

    const resolvedEpisode = resolveLibraryEpisode({
      status,
      animeEpisodes: existing.anime.episodes,
      fallbackEpisode: existing.currentEpisode,
      currentEpisode,
    });

    validateLibraryStatusChange(existing, {
      status,
      currentEpisode: resolvedEpisode,
    });

    await LibraryRepository.updateStatus(userId, animeId, {
      status,
      currentEpisode: resolvedEpisode,
    });

    const updated = await this.getLibraryEntry(userId, animeId);
    if (!updated) {
      throw internalError("Failed to update status");
    }

    return updated;
  }

  static async updateProgress(
    userId: string,
    animeId: number,
    payload: UpdateLibraryProgressBody,
  ): Promise<LibraryEntryDto> {
    const existing = await this.getLibraryEntry(userId, animeId);
    if (!existing) {
      throw notFoundError("Anime not found in your library");
    }

    const nextEpisode = resolveNextProgress(existing, payload);

    await LibraryRepository.updateProgress(userId, animeId, nextEpisode);

    const updated = await this.getLibraryEntry(userId, animeId);
    if (!updated) {
      throw internalError("Failed to update progress");
    }

    return updated;
  }

  static async updateRating(
    userId: string,
    animeId: number,
    payload: UpdateLibraryRatingBody,
  ): Promise<LibraryEntryDto> {
    const existing = await this.getLibraryEntry(userId, animeId);
    if (!existing) {
      throw notFoundError("Anime not found in your library");
    }

    await LibraryRepository.updateRating(userId, animeId, payload.rating);

    const updated = await this.getLibraryEntry(userId, animeId);
    if (!updated) {
      throw internalError("Failed to update rating");
    }

    return updated;
  }

  static async removeFromLibrary(userId: string, animeId: number): Promise<boolean> {
    return LibraryRepository.deleteLibraryEntry(userId, animeId);
  }
}
