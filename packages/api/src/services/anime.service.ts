import { db } from "@anilog/db";
import { anime, heroCuration, trendingAnime, userAnime } from "@anilog/db/schema/anilog";
import { and, asc, desc, eq, getTableColumns, ilike, notInArray, or } from "drizzle-orm";
import { externalServiceError, internalError } from "../errors/api-error";
import type { UpsertAnimeBody } from "../schemas";

const ANILIST_API = "https://graphql.anilist.co";
const SEARCH_CACHE_TTL_MS = 30_000;
const ANILIST_CACHE_TTL_MS = 60_000;

type SearchCacheValue = {
  expiresAt: number;
  value: { library: (typeof anime.$inferSelect)[]; archive: (typeof anime.$inferSelect)[] };
};

type AniListCacheValue = {
  expiresAt: number;
  value: (typeof anime.$inferSelect)[];
};

const archiveSearchCache = new Map<string, SearchCacheValue>();
const anilistSearchCache = new Map<string, AniListCacheValue>();

export class AnimeService {
  static async getHeroCurations() {
    return db
      .select()
      .from(heroCuration)
      .where(eq(heroCuration.isActive, true))
      .orderBy(asc(heroCuration.sortOrder), asc(heroCuration.id));
  }

  static async getTrendingAnime() {
    return db
      .select({
        ...getTableColumns(anime),
      })
      .from(anime)
      .innerJoin(trendingAnime, eq(anime.id, trendingAnime.animeId))
      .orderBy(trendingAnime.rank);
  }

  static async searchArchive(userId: string, userQuery: string, limit: number = 12) {
    const q = userQuery.trim().toLowerCase();
    if (q.length < 2) return { library: [], archive: [] };

    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const cacheKey = `${userId}:${q}:${safeLimit}`;

    const cached = archiveSearchCache.get(cacheKey);
    if (cached && cached?.expiresAt > Date.now()) {
      return cached.value;
    }

    const pattern = `%${q}%`;

    const score = (item: typeof anime.$inferSelect) => {
      let best = 0;
      const titles = [item.title, item.titleJapanese];

      for (const t of titles) {
        if (!t) continue;
        const title = t.toLowerCase();

        if (title === q) return 4;
        if (title.startsWith(q)) best = Math.max(best, 3);
        if (new RegExp(`(^|\\s|[-:()])${q}`).test(title)) best = Math.max(best, 2);
        if (title.includes(q)) best = Math.max(best, 1);
      }

      return best;
    };

    const rank = (rows: (typeof anime.$inferSelect)[]) =>
      rows
        .map((item) => ({ item, score: score(item) }))
        .filter((r) => r.score > 0)
        .sort((a, b) =>
          b.score !== a.score
            ? b.score - a.score
            : b.item.updatedAt.getTime() - a.item.updatedAt.getTime(),
        )
        .slice(0, safeLimit)
        .map((r) => r.item);

    // --- Library ---
    const libraryRows = await db
      .select()
      .from(anime)
      .innerJoin(userAnime, eq(anime.id, userAnime.animeId))
      .where(
        and(
          eq(userAnime.userId, userId),
          or(ilike(anime.title, pattern), ilike(anime.titleJapanese, pattern)),
        ),
      );

    const library = rank(libraryRows.map((r) => r.anime));

    // --- Archive ---
    const excludeIds = library.map((a) => a.id);

    const archiveRows = await db
      .select()
      .from(anime)
      .where(
        and(
          or(ilike(anime.title, pattern), ilike(anime.titleJapanese, pattern)),
          excludeIds.length ? notInArray(anime.id, excludeIds) : undefined,
        ),
      )
      .orderBy(desc(anime.updatedAt))
      .limit(safeLimit * 4);

    const archive = rank(archiveRows);

    const value = { library, archive };

    archiveSearchCache.set(cacheKey, {
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
      value,
    });

    return value;
  }

  static async syncTrendingAnime() {
    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
        query TrendingAnime {
          Page(page: 1, perPage: 100) {
            media(
              type: ANIME
              sort: TRENDING_DESC
              isAdult: false
            ) {
              id
              title { english native }
              episodes
              status
              genres
              coverImage { large }
              seasonYear
              averageScore
            }
          }
        }
      `,
      }),
    });

    if (!res.ok) {
      throw externalServiceError("AniList API failed");
    }

    const {
      data: {
        Page: { media },
      },
    } = (await res.json()) as {
      data: {
        Page: { media: any[] };
      };
    };

    const now = new Date();

    const animeInserts = media.map((m) => {
      const fallbackTitle = m.title?.native || "UNKNOWN";

      return {
        id: m.id, // NOT NULL (AniList guarantees this)
        title: m.title?.english || fallbackTitle,
        titleJapanese: m.title?.native || "",
        episodes: m.episodes ?? 0,
        status: m.status || "UNKNOWN",
        genres: m.genres ?? [],
        imageUrl: m.coverImage?.large || "", // decide if empty string is acceptable
        year: m.seasonYear ?? 0,
        rating: m.averageScore ?? 0,
        createdAt: now,
        updatedAt: now,
      };
    });

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
          updatedAt: now,
        },
      });

    await db.delete(trendingAnime);

    await db.insert(trendingAnime).values(
      media.map((m, i) => ({
        animeId: m.id,
        rank: i + 1,
      })),
    );

    return { success: true, count: media.length };
  }

  static async searchAnime(userQuery: string) {
    const q = userQuery.trim().toLowerCase();
    if (q.length < 3) return [];

    const cached = anilistSearchCache.get(q);
    if (cached && cached?.expiresAt > Date.now()) {
      return cached.value;
    }

    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
        query ($search: String!) {
          Page(page: 1, perPage: 20) {
            media(search: $search, type: ANIME, isAdult: false) {
              id
              title { english native }
              episodes
              status
              genres
              coverImage { large }
              seasonYear
              averageScore
            }
          }
        }
      `,
        variables: { search: q },
      }),
    });

    const json = (await res.json()) as any;

    if (json.errors?.length) {
      throw externalServiceError(json.errors[0]?.message ?? "AniList returned an error");
    }

    const media = json.data?.Page?.media ?? [];
    const now = new Date();

    const result = media
      // search results without images are useless for UI → drop early
      .filter((m: any) => m.coverImage?.large)
      .map((m: any) => {
        const fallbackTitle = m.title?.native || "UNKNOWN";

        return {
          id: m.id,
          title: m.title?.english || fallbackTitle,
          titleJapanese: m.title?.native || "",
          episodes: m.episodes ?? 0,
          status: m.status || "UNKNOWN",
          genres: m.genres ?? [],
          imageUrl: m.coverImage.large,
          year: m.seasonYear ?? 0,
          rating: m.averageScore ?? 0,
          createdAt: now,
          updatedAt: now,
        };
      });

    anilistSearchCache.set(q, {
      expiresAt: Date.now() + ANILIST_CACHE_TTL_MS,
      value: result,
    });

    return result;
  }

  static async upsertAnime(animeData: UpsertAnimeBody) {
    try {
      await db
        .insert(anime)
        .values({
          id: animeData.id,
          title: animeData.title,
          titleJapanese: animeData.titleJapanese,
          episodes: animeData.episodes,
          status: animeData.status,
          genres: animeData.genres,
          imageUrl: animeData.imageUrl,
          year: animeData.year,
          rating: animeData.rating,
        })
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
            updatedAt: new Date(),
          },
        });

      return { id: animeData.id, success: true };
    } catch (error) {
      console.error("Error upserting anime:", error);
      throw internalError("Failed to upsert anime");
    }
  }
}
