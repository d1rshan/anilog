import { Elysia, t } from "elysia";
import { AnimeService } from "@anilog/api";
import { auth } from "@anilog/auth";

type UpsertAnimeInput = Parameters<typeof AnimeService.upsertAnime>[0];
const cronSecret = process.env.CRON_SECRET;

function isCronAuthorized(request: Request) {
  if (!cronSecret) return false;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export const animeRoutes = new Elysia({ prefix: "/anime" })
  .get("/trending", async () => {
    const anime = await AnimeService.getTrendingAnime();
    return anime;
  })
  .get("/sync", async ({ request, set }) => {
    if (!isCronAuthorized(request)) {
      set.status = 401;
      return { success: false, error: "Unauthorized" };
    }
    const result = await AnimeService.syncTrendingAnime();
    return result;
  })
  .get("/sync-all", async ({ request, set }) => {
    if (!isCronAuthorized(request)) {
      set.status = 401;
      return { success: false, error: "Unauthorized" };
    }
    const result = await AnimeService.syncAllAnime();
    return result;
  })
  .get("/search/:query", async ({ params }) => {
    const result = await AnimeService.searchAnime(params.query);
    return result;
  }, {
    params: t.Object({ query: t.String() })
  })
  .get("/archive-search", async ({ request, query, set }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      set.status = 401;
      return { error: "User not authenticated" };
    }

    const q = query.q?.trim() ?? "";
    const limit = query.limit ?? 12;

    return await AnimeService.searchArchive(session.user.id, q, limit);
  }, {
    query: t.Object({
      q: t.String(),
      limit: t.Optional(t.Integer({ minimum: 1, maximum: 50 })),
    }),
  })
  .post("/upsert", async ({ body }) => {
    const result = await AnimeService.upsertAnime(body as UpsertAnimeInput);
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
