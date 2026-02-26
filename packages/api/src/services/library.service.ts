import { db } from "@anilog/db";
import { anime, userAnime, type LibraryStatus } from "@anilog/db/schema/anilog";
import { and, asc, eq, getTableColumns } from "drizzle-orm";
import { internalError, notFoundError, validationError } from "../errors/api-error";

const STATUS_COMPLETION_BLOCKLIST = new Set(["RELEASING", "NOT_YET_RELEASED"]);

type ValidationInput = {
  status: LibraryStatus;
  currentEpisode?: number | null;
  animeStatus?: string | null;
  totalEpisodes?: number | null;
};

type LogAnimeInput = {
  anime: {
    id: number;
    title: string;
    titleJapanese?: string | null;
    description?: string | null;
    episodes?: number | null;
    status?: string | null;
    genres?: string[] | null;
    imageUrl: string;
    year?: number | null;
    rating?: number | null;
  };
  status: LibraryStatus;
  currentEpisode?: number;
  rating?: number | null;
};

function validateStatusRules(input: ValidationInput) {
  const animeStatus = (input.animeStatus ?? "").toUpperCase();

  if (animeStatus === "NOT_YET_RELEASED" && input.status !== "planned") {
    throw validationError("Only Planned is allowed for unreleased anime");
  }

  if (input.status === "completed" && STATUS_COMPLETION_BLOCKLIST.has(animeStatus)) {
    throw validationError("Cannot mark as Completed until the anime is finished");
  }

  if (input.status === "watching" && (!input.currentEpisode || input.currentEpisode < 1)) {
    throw validationError("Current episode is required for Watching");
  }

  if (input.status === "completed") {
    if (!input.currentEpisode || input.currentEpisode < 1) {
      throw validationError("Current episode is required for Completed");
    }

    if (input.totalEpisodes && input.currentEpisode < input.totalEpisodes) {
      throw validationError("Completed anime must have all episodes watched");
    }
  }
}

export class LibraryService {
  static async getUserLibrary(userId: string) {
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
        },
      })
      .from(userAnime)
      .innerJoin(anime, eq(userAnime.animeId, anime.id))
      .where(eq(userAnime.userId, userId))
      .orderBy(asc(userAnime.createdAt));

    return rows;
  }

  private static async getLibraryEntry(userId: string, animeId: number) {
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
        },
      })
      .from(userAnime)
      .innerJoin(anime, eq(userAnime.animeId, anime.id))
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)))
      .limit(1);

    return result[0] ?? null;
  }

  static async logAnime(userId: string, input: LogAnimeInput) {
    await db
      .insert(anime)
      .values({
        id: input.anime.id,
        title: input.anime.title,
        titleJapanese: input.anime.titleJapanese,
        description: input.anime.description,
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
          description: input.anime.description,
          episodes: input.anime.episodes,
          status: input.anime.status,
          genres: input.anime.genres,
          imageUrl: input.anime.imageUrl,
          year: input.anime.year,
          rating: input.anime.rating,
          updatedAt: new Date(),
        },
      });

    const resolvedEpisode =
      input.status === "completed" && input.anime.episodes && input.anime.episodes > 0
        ? input.anime.episodes
        : Math.max(0, input.currentEpisode ?? 0);

    validateStatusRules({
      status: input.status,
      currentEpisode: resolvedEpisode,
      animeStatus: input.anime.status,
      totalEpisodes: input.anime.episodes,
    });

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
          updatedAt: new Date(),
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
    status: LibraryStatus,
    currentEpisode?: number,
  ) {
    const existing = await this.getLibraryEntry(userId, animeId);
    if (!existing) {
      throw notFoundError("Anime not found in your library");
    }

    const resolvedEpisode =
      status === "completed" && existing.anime.episodes && existing.anime.episodes > 0
        ? existing.anime.episodes
        : (currentEpisode ?? existing.currentEpisode);

    validateStatusRules({
      status,
      currentEpisode: resolvedEpisode,
      animeStatus: existing.anime.status,
      totalEpisodes: existing.anime.episodes,
    });

    await db
      .update(userAnime)
      .set({
        status,
        currentEpisode: resolvedEpisode,
        updatedAt: new Date(),
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
    payload: { currentEpisode?: number; delta?: number },
  ) {
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

  static async updateRating(userId: string, animeId: number, rating: number | null) {
    const existing = await this.getLibraryEntry(userId, animeId);
    if (!existing) {
      throw notFoundError("Anime not found in your library");
    }

    await db
      .update(userAnime)
      .set({
        rating,
        updatedAt: new Date(),
      })
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)));

    const updated = await this.getLibraryEntry(userId, animeId);
    if (!updated) {
      throw internalError("Failed to update rating");
    }

    return updated;
  }

  static async removeFromLibrary(userId: string, animeId: number) {
    const result = await db
      .delete(userAnime)
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)))
      .returning();

    return result.length > 0;
  }
}
