import { Elysia, t } from "elysia";
import { AnimeService } from "@anilog/api";

export const animeRoutes = new Elysia({ prefix: "/anime" })
  .get("/trending", async () => {
    const anime = await AnimeService.getTrendingAnime();
    return anime;
  })
  .get("/search/:query", async ({ params }) => {
    const result = await AnimeService.searchAnime(params.query);
    return result;
  }, {
    params: t.Object({ query: t.String() })
  });
