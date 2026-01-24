import { Elysia, t } from "elysia";
import { AnimeService } from "@anilog/api";


export const animeRoutes = new Elysia({ prefix: "/anime" })
  .get("/", async () => {
    try {
      const anime = await AnimeService.getTrendingAnime();
      return { success: true, data: anime };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch trending anime"
      };
    }
  })
  .get(
    "/search/:query",
    async ({ params }) => {
      try {
        const anime = await AnimeService.searchAnime(params.query)
        return { success: true, data: anime };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to fetch anime"
        };
      }
    },
    {
      params: t.Object({
        query: t.String()
      }),
    }
  );
