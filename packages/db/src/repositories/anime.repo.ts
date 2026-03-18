import { db } from "../client";
import { anime, heroCuration, trendingAnime, userAnime } from "../schema/anilog";
import { and, asc, desc, eq, getTableColumns, ilike, notInArray, or } from "drizzle-orm";

export type AnimeRecord = typeof anime.$inferSelect;
export type HeroCurationRecord = typeof heroCuration.$inferSelect;

export class AnimeRepository {
  static async findHeroCurations(): Promise<HeroCurationRecord[]> {
    return db
      .select()
      .from(heroCuration)
      .where(eq(heroCuration.isActive, true))
      .orderBy(asc(heroCuration.sortOrder), asc(heroCuration.id));
  }

  static async findTrendingAnime(): Promise<AnimeRecord[]> {
    return db
      .select({
        ...getTableColumns(anime),
      })
      .from(anime)
      .innerJoin(trendingAnime, eq(anime.id, trendingAnime.animeId))
      .orderBy(trendingAnime.rank);
  }

  static async findArchiveLibraryMatches(userId: string, pattern: string) {
    const rows = await db
      .select()
      .from(anime)
      .innerJoin(userAnime, eq(anime.id, userAnime.animeId))
      .where(
        and(
          eq(userAnime.userId, userId),
          or(ilike(anime.title, pattern), ilike(anime.titleJapanese, pattern)),
        ),
      );

    return rows.map((row) => row.anime);
  }

  static async findArchiveMatches(pattern: string, excludeIds: number[], limit: number) {
    return db
      .select()
      .from(anime)
      .where(
        and(
          or(ilike(anime.title, pattern), ilike(anime.titleJapanese, pattern)),
          excludeIds.length ? notInArray(anime.id, excludeIds) : undefined,
        ),
      )
      .orderBy(desc(anime.updatedAt))
      .limit(limit);
  }

  static async upsertAnimeMany(animeInserts: Array<typeof anime.$inferInsert>) {
    await db
      .insert(anime)
      .values(animeInserts)
      .onConflictDoUpdate({
        target: anime.id,
        set: {
          title: anime.title,
          titleJapanese: anime.titleJapanese,
          episodes: anime.episodes,
          status: anime.status,
          genres: anime.genres,
          imageUrl: anime.imageUrl,
          year: anime.year,
          rating: anime.rating,
        },
      });
  }

  static async replaceTrending(animeIds: number[]) {
    await db.delete(trendingAnime);

    await db.insert(trendingAnime).values(
      animeIds.map((animeId, index) => ({
        animeId,
        rank: index + 1,
      })),
    );
  }

  static async upsertAnime(animeData: typeof anime.$inferInsert) {
    await db
      .insert(anime)
      .values(animeData)
      .onConflictDoUpdate({
        target: anime.id,
        set: {
          title: animeData.title,
          titleJapanese: animeData.titleJapanese,
          episodes: animeData.episodes,
          status: animeData.status,
          genres: animeData.genres,
          imageUrl: animeData.imageUrl,
          year: animeData.year,
          rating: animeData.rating,
        },
      });
  }
}
