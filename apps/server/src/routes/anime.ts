import { Elysia, t } from "elysia";
import { AnimeService } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  archiveSearchResponseSchema,
  animeSchema,
  errorResponseSchema,
  heroCurationSchema,
  successCountSchema,
  upsertAnimeResultSchema,
} from "./schemas";

const cronSecret = process.env.CRON_SECRET;

function isCronAuthorized(request: Request) {
  if (!cronSecret) return false;
  return request.headers.get("authorization") === `Bearer ${cronSecret}`;
}

export const animeRoutes = new Elysia({ prefix: "/anime" })
  .get(
    "/hero-curations",
    async () => {
      return AnimeService.getHeroCurations();
    },
    {
      response: {
        200: t.Array(heroCurationSchema),
      },
    },
  )
  .get(
    "/trending",
    async () => {
      return AnimeService.getTrendingAnime();
    },
    {
      response: {
        200: t.Array(animeSchema),
      },
    },
  )
  .get(
    "/sync",
    async ({ request, set }) => {
      if (!isCronAuthorized(request)) {
        set.status = 401;
        return { success: false, error: "Unauthorized" };
      }
      return AnimeService.syncTrendingAnime();
    },
    {
      response: {
        200: successCountSchema,
        401: t.Object({ success: t.Boolean(), error: t.String() }),
      },
    },
  )
  .get(
    "/sync-all",
    async ({ request, set }) => {
      if (!isCronAuthorized(request)) {
        set.status = 401;
        return { success: false, error: "Unauthorized" };
      }
      return AnimeService.syncAllAnime();
    },
    {
      response: {
        200: successCountSchema,
        401: t.Object({ success: t.Boolean(), error: t.String() }),
      },
    },
  )
  .get(
    "/search/:query",
    async ({ params }) => {
      return AnimeService.searchAnime(params.query);
    },
    {
      params: t.Object({ query: t.String() }),
      response: {
        200: t.Array(animeSchema),
      },
    },
  )
  .get(
    "/archive-search",
    async ({ request, query, set }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user?.id) {
        set.status = 401;
        return { error: "User not authenticated" };
      }

      const q = query.q?.trim() ?? "";
      const limit = query.limit ?? 12;

      return AnimeService.searchArchive(session.user.id, q, limit);
    },
    {
      query: t.Object({
        q: t.String(),
        limit: t.Optional(t.Integer({ minimum: 1, maximum: 50 })),
      }),
      response: {
        200: archiveSearchResponseSchema,
        401: errorResponseSchema,
      },
    },
  )
  .post(
    "/upsert",
    async ({ body }) => {
      return AnimeService.upsertAnime(body);
    },
    {
      body: t.Object({
        id: t.Integer(),
        title: t.String(),
        titleJapanese: t.Optional(t.Nullable(t.String())),
        description: t.Optional(t.Nullable(t.String())),
        episodes: t.Optional(t.Nullable(t.Integer())),
        status: t.Optional(t.Nullable(t.String())),
        genres: t.Optional(t.Nullable(t.Array(t.String()))),
        imageUrl: t.String(),
        bannerImage: t.Optional(t.Nullable(t.String())),
        year: t.Optional(t.Nullable(t.Integer())),
        rating: t.Optional(t.Nullable(t.Integer())),
      }),
      response: {
        200: upsertAnimeResultSchema,
      },
    },
  );
