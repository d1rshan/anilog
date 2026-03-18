import { db } from "../client";
import { anime, type LibraryStatus, userAnime } from "../schema/anilog";
import { and, asc, eq, getTableColumns } from "drizzle-orm";

export type AnimeSummaryRecord = {
  id: number;
  title: string;
  titleJapanese: string;
  imageUrl: string;
  year: number;
  episodes: number;
  status: string;
  genres: string[];
  rating: number;
};

export type LibraryEntryRecord = {
  id: string;
  userId: string;
  animeId: number;
  status: LibraryStatus;
  currentEpisode: number;
  rating: number | null;
  createdAt: Date;
  updatedAt: Date;
  anime: AnimeSummaryRecord;
};

export type UpsertAnimeRecordInput = AnimeSummaryRecord;

export type UpsertLibraryEntryInput = {
  userId: string;
  animeId: number;
  status: LibraryStatus;
  currentEpisode: number;
  rating: number | null;
};

function libraryEntrySelect() {
  return {
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
  };
}

export class LibraryRepository {
  static async findUserLibrary(userId: string): Promise<LibraryEntryRecord[]> {
    const rows = await db
      .select(libraryEntrySelect())
      .from(userAnime)
      .innerJoin(anime, eq(userAnime.animeId, anime.id))
      .where(eq(userAnime.userId, userId))
      .orderBy(asc(userAnime.createdAt));

    return rows;
  }

  static async findLibraryEntry(
    userId: string,
    animeId: number,
  ): Promise<LibraryEntryRecord | null> {
    const rows = await db
      .select(libraryEntrySelect())
      .from(userAnime)
      .innerJoin(anime, eq(userAnime.animeId, anime.id))
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)))
      .limit(1);

    return rows[0] ?? null;
  }

  static async upsertAnime(input: UpsertAnimeRecordInput): Promise<void> {
    await db
      .insert(anime)
      .values({
        id: input.id,
        title: input.title,
        titleJapanese: input.titleJapanese,
        episodes: input.episodes,
        status: input.status,
        genres: input.genres,
        imageUrl: input.imageUrl,
        year: input.year,
        rating: input.rating,
      })
      .onConflictDoUpdate({
        target: anime.id,
        set: {
          title: input.title,
          titleJapanese: input.titleJapanese,
          episodes: input.episodes,
          status: input.status,
          genres: input.genres,
          imageUrl: input.imageUrl,
          year: input.year,
          rating: input.rating,
        },
      });
  }

  static async upsertLibraryEntry(input: UpsertLibraryEntryInput): Promise<void> {
    await db
      .insert(userAnime)
      .values(input)
      .onConflictDoUpdate({
        target: [userAnime.userId, userAnime.animeId],
        set: {
          status: input.status,
          currentEpisode: input.currentEpisode,
          rating: input.rating,
        },
      });
  }

  static async updateStatus(
    userId: string,
    animeId: number,
    input: Pick<UpsertLibraryEntryInput, "status" | "currentEpisode">,
  ): Promise<void> {
    await db
      .update(userAnime)
      .set({
        status: input.status,
        currentEpisode: input.currentEpisode,
      })
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)));
  }

  static async updateProgress(
    userId: string,
    animeId: number,
    currentEpisode: number,
  ): Promise<void> {
    await db
      .update(userAnime)
      .set({
        currentEpisode,
        updatedAt: new Date(),
      })
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)));
  }

  static async updateRating(userId: string, animeId: number, rating: number | null): Promise<void> {
    await db
      .update(userAnime)
      .set({
        rating,
        updatedAt: new Date(),
      })
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)));
  }

  static async deleteLibraryEntry(userId: string, animeId: number): Promise<boolean> {
    const deleted = await db
      .delete(userAnime)
      .where(and(eq(userAnime.userId, userId), eq(userAnime.animeId, animeId)))
      .returning();

    return deleted.length > 0;
  }
}
