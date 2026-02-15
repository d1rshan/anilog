import { db } from "@anilog/db";
import { anime, trendingAnime, userAnime } from "@anilog/db/schema/anilog";
import { and, desc, eq, getTableColumns, ilike, notInArray, or } from "drizzle-orm";


const ANILIST_API = "https://graphql.anilist.co";
const SEARCH_CACHE_TTL_MS = 30_000;
const ANILIST_CACHE_TTL_MS = 60_000;

type SearchCacheValue = {
  expiresAt: number;
  value: { library: typeof anime.$inferSelect[]; archive: typeof anime.$inferSelect[] };
};

type AniListCacheValue = {
  expiresAt: number;
  value: typeof anime.$inferSelect[];
};

const archiveSearchCache = new Map<string, SearchCacheValue>();
const anilistSearchCache = new Map<string, AniListCacheValue>();

type AniListMedia = {
  id: number;
  title: { english: string | null; native: string | null; };
  description: string | null;
  episodes: number | null;
  status: string | null;
  genres: string[];
  coverImage: { extraLarge: string; large: string; };
  bannerImage: string | null;
  seasonYear: number | null;
  averageScore: number | null;
};

type AniListPageResponse = {
  data?: {
    Page?: {
      media?: AniListMedia[];
    };
  };
};

export class AnimeService {
  private static getMatchScore(animeItem: typeof anime.$inferSelect, query: string) {
    const normalizedQuery = query.toLowerCase();
    const titles = [animeItem.title, animeItem.titleJapanese].filter((title): title is string => Boolean(title));
    let bestScore = 0;

    for (const title of titles) {
      const normalizedTitle = title.toLowerCase();

      if (normalizedTitle === normalizedQuery) {
        return 4;
      }

      if (normalizedTitle.startsWith(normalizedQuery)) {
        bestScore = Math.max(bestScore, 3);
      }

      const wordBoundary = new RegExp(`(^|\\s|[-:()])${normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
      if (wordBoundary.test(normalizedTitle)) {
        bestScore = Math.max(bestScore, 2);
      }

      if (normalizedTitle.includes(normalizedQuery)) {
        bestScore = Math.max(bestScore, 1);
      }
    }

    return bestScore;
  }

  private static rankMatches(items: typeof anime.$inferSelect[], query: string, limit: number) {
    return items
      .map((item) => ({
        item,
        score: this.getMatchScore(item, query),
      }))
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }

        const updatedA = new Date(a.item.updatedAt).getTime();
        const updatedB = new Date(b.item.updatedAt).getTime();
        return updatedB - updatedA;
      })
      .slice(0, limit)
      .map((entry) => entry.item);
  }

  static async getTrendingAnime() {
    try {
      const result = await db.select({
        ...getTableColumns(anime)
      }).from(anime).innerJoin(trendingAnime, eq(anime.id, trendingAnime.animeId)).orderBy(trendingAnime.rank)
      return result
    } catch (error) {
      console.error("Error getting all anime:", error);
      throw new Error("Failed to fetch anime");
    }
  }

  static async searchArchive(userId: string, userQuery: string, limit: number = 12) {
    const normalizedQuery = userQuery.trim().toLowerCase();
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    if (normalizedQuery.length < 2) {
      return { library: [], archive: [] };
    }

    const cacheKey = `${userId}:${normalizedQuery}:${safeLimit}`;
    const cached = archiveSearchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const pattern = `%${normalizedQuery}%`;

    const libraryRows = await db
      .select({
        ...getTableColumns(anime),
      })
      .from(anime)
      .innerJoin(userAnime, eq(anime.id, userAnime.animeId))
      .where(
        and(
          eq(userAnime.userId, userId),
          or(ilike(anime.title, pattern), ilike(anime.titleJapanese, pattern)),
        ),
      );

    const libraryResult = this.rankMatches(libraryRows, normalizedQuery, safeLimit);

    const excludeIds = new Set(libraryResult.map((item) => item.id));
    const whereClauses = [or(ilike(anime.title, pattern), ilike(anime.titleJapanese, pattern))];
    if (excludeIds.size > 0) {
      whereClauses.push(notInArray(anime.id, Array.from(excludeIds)));
    }

    const archiveRows = await db
      .select({
        ...getTableColumns(anime),
      })
      .from(anime)
      .where(and(...whereClauses))
      .orderBy(desc(anime.updatedAt))
      .limit(safeLimit * 4);

    const archiveResult = this.rankMatches(archiveRows, normalizedQuery, safeLimit);

    const value = { library: libraryResult, archive: archiveResult };
    archiveSearchCache.set(cacheKey, {
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
      value,
    });

    return value;
  }

  static async syncAllAnime(): Promise<{ success: boolean; count: number }> {
    const allAnime = await db.select({ id: anime.id }).from(anime);
    const ids = allAnime.map((a) => a.id);

    if (ids.length === 0) return { success: true, count: 0 };

    const batchSize = 50;
    let count = 0;

    for (let i = 0; i < ids.length; i += batchSize) {
      const batchIds = ids.slice(i, i + batchSize);
      const query = `
        query ($ids: [Int]) {
          Page(page: 1, perPage: 50) {
            media(id_in: $ids, type: ANIME) {
              id
              title { english native }
              description
              episodes
              status
              genres
              coverImage { extraLarge large }
              bannerImage
              seasonYear
              averageScore
            }
          }
        }
      `;

      const res = await fetch(ANILIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ query, variables: { ids: batchIds } }),
      });

      if (!res.ok) continue;

      const json = (await res.json()) as AniListPageResponse;
      const mediaList = json.data?.Page?.media;

      if (!mediaList) continue;

      const animeInserts = mediaList.map((media) => ({
        id: media.id,
        title: media.title.english ?? media.title.native ?? "UNKNOWN",
        titleJapanese: media.title.native,
        description: media.description,
        episodes: media.episodes,
        status: media.status,
        genres: media.genres,
        imageUrl: media.coverImage?.extraLarge ?? media.coverImage?.large,
        bannerImage: media.bannerImage,
        year: media.seasonYear,
        rating: media.averageScore,
        updatedAt: new Date()
      }));

      for (const item of animeInserts) {
        await db.insert(anime).values(item).onConflictDoUpdate({
          target: anime.id,
          set: item
        });
      }
      
      count += animeInserts.length;
    }

    return { success: true, count };
  }

  static async syncTrendingAnime(): Promise<{ success: boolean; count: number }> {
    const query = `
      query TrendingAnime {
        Page(page: 1, perPage: 100) {
          media(
            type: ANIME
            sort: TRENDING_DESC
            isAdult: false
          ) {
            id
            title {
              english
              native
            }
            description
            episodes
            status
            genres
            coverImage {
              extraLarge
              large
            }
            bannerImage
            seasonYear
            averageScore
          }
        }
      }
    `;

    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ query })
    });

    if (!res.ok) {
      throw new Error("AniList API failed");
    }

    type TrendingAnimeResponse = {
      data: {
        Page: {
          media: Array<{
            id: number;
            title: { english: string | null; native: string | null; };
            description: string | null;
            episodes: number | null;
            status: string | null;
            genres: string[];
            coverImage: { extraLarge: string; large: string; };
            bannerImage: string | null;
            seasonYear: number | null;
            averageScore: number | null;
          }>;
        };
      };
    };

    const json = (await res.json()) as TrendingAnimeResponse;

    const animeInserts = json.data.Page.media.map((media) => ({
      id: media.id,
      title: media.title.english ?? media.title.native ?? "UNKNOWN",
      titleJapanese: media.title.native,
      description: media.description,
      episodes: media.episodes,
      status: media.status,
      genres: media.genres,
      imageUrl: media.coverImage?.extraLarge ?? media.coverImage?.large,
      bannerImage: media.bannerImage,
      year: media.seasonYear,
      rating: media.averageScore,
    }));

    // Upsert anime data
    await db.insert(anime).values(animeInserts).onConflictDoUpdate({
      target: anime.id,
      set: {
        title: anime.title,
        titleJapanese: anime.titleJapanese,
        description: anime.description,
        episodes: anime.episodes,
        status: anime.status,
        genres: anime.genres,
        imageUrl: anime.imageUrl,
        bannerImage: anime.bannerImage,
        year: anime.year,
        rating: anime.rating,
        updatedAt: new Date()
      }
    });

    // Clear and insert trending rankings
    await db.delete(trendingAnime);

    const trendingInserts = json.data.Page.media.map((media, index) => ({
      animeId: media.id,
      rank: index + 1
    }));

    await db.insert(trendingAnime).values(trendingInserts);

    return { success: true, count: json.data.Page.media.length };
  }

  static async searchAnime(userQuery: string) {
    const normalizedQuery = userQuery.trim().toLowerCase();
    if (normalizedQuery.length < 3) {
      return [];
    }

    const cached = anilistSearchCache.get(normalizedQuery);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    const query = `
        query ($search: String!) {
          Page(page: 1, perPage: 20) {
            media(search: $search, type: ANIME, isAdult: false) {
              id
              title {
                english
                native
              }
              description
              episodes
              status
              genres
              coverImage {
                extraLarge
                large
              }
              bannerImage
              seasonYear
              averageScore
            }
          }
        }
      `;

    try {
      const res = await fetch(ANILIST_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          query,
          variables: {
            search: normalizedQuery
          }
        })
      });

      const json: any = await res.json();

      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      // Transform AniList response to match Anime type
      const result = json.data.Page.media.map((media: any) => ({
        id: media.id,
        title: media.title.english ?? media.title.native ?? "Unknown",
        titleJapanese: media.title.native,
        description: media.description,
        episodes: media.episodes,
        status: media.status,
        genres: media.genres,
        imageUrl: media.coverImage?.extraLarge ?? media.coverImage?.large,
        bannerImage: media.bannerImage,
        year: media.seasonYear,
        rating: media.averageScore,
      }));

      anilistSearchCache.set(normalizedQuery, {
        expiresAt: Date.now() + ANILIST_CACHE_TTL_MS,
        value: result,
      });

      return result;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Failed to search anime");
    }
  }

  static async upsertAnime(animeData: {
    id: number;
    title: string;
    titleJapanese?: string | null;
    description?: string | null;
    episodes?: number | null;
    status?: string | null;
    genres?: string[] | null;
    imageUrl: string;
    bannerImage?: string | null;
    year?: number | null;
    rating?: number | null;
  }) {
    try {
      await db.insert(anime).values({
        id: animeData.id,
        title: animeData.title,
        titleJapanese: animeData.titleJapanese,
        description: animeData.description,
        episodes: animeData.episodes,
        status: animeData.status,
        genres: animeData.genres,
        imageUrl: animeData.imageUrl,
        bannerImage: animeData.bannerImage,
        year: animeData.year,
        rating: animeData.rating,
      }).onConflictDoUpdate({
        target: anime.id,
        set: {
          title: animeData.title,
          titleJapanese: animeData.titleJapanese,
          description: animeData.description,
          episodes: animeData.episodes,
          status: animeData.status,
          genres: animeData.genres,
          imageUrl: animeData.imageUrl,
          bannerImage: animeData.bannerImage,
          year: animeData.year,
          rating: animeData.rating,
          updatedAt: new Date()
        }
      });

      return { id: animeData.id, success: true };
    } catch (error) {
      console.error("Error upserting anime:", error);
      throw new Error("Failed to upsert anime");
    }
  }
}
