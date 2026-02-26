import { Elysia, t } from "elysia";
import { AnimeService } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  archiveSearchQuerySchema,
  archiveSearchResponseSchema,
  animeSchema,
  errorResponseSchema,
  heroCurationSchema,
  successCountSchema,
  syncUnauthorizedResponseSchema,
  upsertAnimeInputSchema,
  upsertAnimeResultSchema,
} from "../schemas";

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
        401: syncUnauthorizedResponseSchema,
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
        401: syncUnauthorizedResponseSchema,
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
      query: archiveSearchQuerySchema,
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
      body: upsertAnimeInputSchema,
      response: {
        200: upsertAnimeResultSchema,
      },
    },
  );
