import type {
  LibraryEntryDto,
  LogAnimeBody,
  UpdateLibraryProgressBody,
  UpdateLibraryRatingBody,
  UpdateLibraryStatusBody,
} from "@anilog/contracts";
import { db } from "@anilog/db";
import { anime, userAnime } from "@anilog/db/schema/anilog";
import { and, asc, eq, getTableColumns } from "drizzle-orm";
import { internalError, notFoundError, validationError } from "../shared/errors/api-error";

export class LibraryService {
  static async getUserLibrary(userId: string): Promise<LibraryEntryDto[]> {
    const rows = await db
      .select({
        ...getTableColumns(userAnime),
        anime: {
          id: anime.id,
          title: anime.title,
          titleJapanese: anime.titleJapanese,
          imageUrl: anime.imageUrl,
          year: anime.year,
          episodes: anime.episodes,
          status: anime.status,
          genres: anime.genres,
          rating: anime.rating,
        },
      })
      .from(userAnime)
      .innerJoin(anime, eq(userAnime.animeId, anime.id))
      .where(eq(userAnime.userId, userId))
      .orderBy(asc(userAnime.createdAt));

    return rows;
  }

  private static async getLibraryEntry(
    userId: string,
    animeId: number,
  ): Promise<LibraryEntryDto | null> {
    const result = await db
      .select({
        ...getTableColumns(userAnime),
        anime: {
          id: anime.id,
          title: anime.title,
          titleJapanese: anime.titleJapanese,
          imageUrl: anime.imageUrl,
          year: anime.year,
          episodes: anime.episodes,
          status: anime.status,
          genres: anime.genres,
          rating: anime.rating,
        },
      })
      .from(userAnime)
      .innerJoin(anime, eq(userAnime.animeId, anime.id))
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)))
      .limit(1);

    return result[0] ?? null;
  }

  static async logAnime(userId: string, input: LogAnimeBody): Promise<LibraryEntryDto> {
    await db
      .insert(anime)
      .values({
        id: input.anime.id,
        title: input.anime.title,
        titleJapanese: input.anime.titleJapanese,
        episodes: input.anime.episodes,
        status: input.anime.status,
        genres: input.anime.genres,
        imageUrl: input.anime.imageUrl,
        year: input.anime.year,
        rating: input.anime.rating,
      })
      .onConflictDoUpdate({
        target: anime.id,
        set: {
          title: input.anime.title,
          titleJapanese: input.anime.titleJapanese,
          episodes: input.anime.episodes,
          status: input.anime.status,
          genres: input.anime.genres,
          imageUrl: input.anime.imageUrl,
          year: input.anime.year,
          rating: input.anime.rating,
        },
      });

    const resolvedEpisode =
      input.status === "completed" && input.anime.episodes && input.anime.episodes > 0
        ? input.anime.episodes
        : Math.max(0, input.currentEpisode ?? 0);

    {
      const animeStatus = (input.anime.status ?? "").toUpperCase();

      if (animeStatus === "NOT_YET_RELEASED" && input.status !== "watchlist") {
        throw validationError("Only Planned is allowed for unreleased anime");
      }

      if (
        input.status === "completed" &&
        new Set(["RELEASING", "NOT_YET_RELEASED"]).has(animeStatus)
      ) {
        throw validationError("Cannot mark as Completed until the anime is finished");
      }

      if (input.status === "watching" && (!resolvedEpisode || resolvedEpisode < 1)) {
        throw validationError("Current episode is required for Watching");
      }

      if (input.status === "completed") {
        if (!resolvedEpisode || resolvedEpisode < 1) {
          throw validationError("Current episode is required for Completed");
        }

        if (input.anime.episodes && resolvedEpisode < input.anime.episodes) {
          throw validationError("Completed anime must have all episodes watched");
        }
      }
    }

    await db
      .insert(userAnime)
      .values({
        userId,
        animeId: input.anime.id,
        status: input.status,
        currentEpisode: resolvedEpisode,
        rating: input.rating ?? null,
      })
      .onConflictDoUpdate({
        target: [userAnime.userId, userAnime.animeId],
        set: {
          status: input.status,
          currentEpisode: resolvedEpisode,
          rating: input.rating ?? null,
        },
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

    const resolvedEpisode =
      status === "completed" && existing.anime.episodes && existing.anime.episodes > 0
        ? existing.anime.episodes
        : (currentEpisode ?? existing.currentEpisode);

    {
      const animeStatus = (existing.anime.status ?? "").toUpperCase();

      if (animeStatus === "NOT_YET_RELEASED" && status !== "watchlist") {
        throw validationError("Only Planned is allowed for unreleased anime");
      }

      if (status === "completed" && new Set(["RELEASING", "NOT_YET_RELEASED"]).has(animeStatus)) {
        throw validationError("Cannot mark as Completed until the anime is finished");
      }

      if (status === "watching" && (!resolvedEpisode || resolvedEpisode < 1)) {
        throw validationError("Current episode is required for Watching");
      }

      if (status === "completed") {
        if (!resolvedEpisode || resolvedEpisode < 1) {
          throw validationError("Current episode is required for Completed");
        }

        if (existing.anime.episodes && resolvedEpisode < existing.anime.episodes) {
          throw validationError("Completed anime must have all episodes watched");
        }
      }
    }

    await db
      .update(userAnime)
      .set({
        status,
        currentEpisode: resolvedEpisode,
      })
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)));

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
    if (payload.currentEpisode === undefined && payload.delta === undefined) {
      throw validationError("Provide currentEpisode or delta for progress update");
    }

    const existing = await this.getLibraryEntry(userId, animeId);
    if (!existing) {
      throw notFoundError("Anime not found in your library");
    }

    if (existing.status !== "watching") {
      throw validationError("Progress can only be updated for Watching anime");
    }

    const nextEpisodeRaw =
      payload.currentEpisode !== undefined
        ? payload.currentEpisode
        : existing.currentEpisode + (payload.delta ?? 0);

    const nextEpisode = Math.max(1, nextEpisodeRaw);

    await db
      .update(userAnime)
      .set({
        currentEpisode: nextEpisode,
        updatedAt: new Date(),
      })
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)));

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

    await db
      .update(userAnime)
      .set({
        rating: payload.rating,
        updatedAt: new Date(),
      })
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)));

    const updated = await this.getLibraryEntry(userId, animeId);
    if (!updated) {
      throw internalError("Failed to update rating");
    }

    return updated;
  }

  static async removeFromLibrary(userId: string, animeId: number): Promise<boolean> {
    const result = await db
      .delete(userAnime)
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)))
      .returning();

    return result.length > 0;
  }
}
