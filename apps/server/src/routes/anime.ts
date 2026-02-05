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
  })
  .post("/upsert", async ({ body }) => {
    const result = await AnimeService.upsertAnime(body);
    return result;
  }, {
    body: t.Object({
      id: t.Integer(),
      title: t.String(),
      titleJapanese: t.Optional(t.Nullable(t.String())),
      description: t.Optional(t.Nullable(t.String())),
      episodes: t.Optional(t.Nullable(t.Integer())),
      status: t.Optional(t.Nullable(t.String())),
      genres: t.Optional(t.Nullable(t.Array(t.String()))),
      imageUrl: t.String(),
      year: t.Optional(t.Nullable(t.Integer())),
      rating: t.Optional(t.Nullable(t.Integer()))
    })
  });
