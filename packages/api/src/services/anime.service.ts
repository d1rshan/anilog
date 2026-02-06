import { db } from "@anilog/db";
import { anime, trendingAnime } from "@anilog/db/schema/anilog";
import { eq, getTableColumns } from "drizzle-orm"


const ANILIST_API = "https://graphql.anilist.co";

export class AnimeService {
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
              large
            }
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
            coverImage: { large: string; };
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
      imageUrl: media.coverImage?.large,
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
                large
              }
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
            search: userQuery
          }
        })
      });

      const json: any = await res.json();

      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      // Transform AniList response to match Anime type
      return json.data.Page.media.map((media: any) => ({
        id: media.id,
        title: media.title.english ?? media.title.native ?? "Unknown",
        titleJapanese: media.title.native,
        description: media.description,
        episodes: media.episodes,
        status: media.status,
        genres: media.genres,
        imageUrl: media.coverImage?.large,
        year: media.seasonYear,
        rating: media.averageScore,
      }));
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
