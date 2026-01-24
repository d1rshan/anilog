import { db } from "@anilog/db";
import { anime, trendingAnime } from "@anilog/db/schema/anime";
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

  static async searchAnime(userQuery: string) {
    const query = `
        query ($search: String!) {
          Page(page: 1, perPage: 5) {
            media(search: $search, type: ANIME) {
              id
              title {
                english
                native
              }
              episodes
              coverImage {
                large
                color
              }
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

      return {
        success: true,
        data: json.data.Page.media
      };
    } catch (error) {
      return {
        success: false,

      };
    }
  }
}
