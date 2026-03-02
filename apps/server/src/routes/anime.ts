import { Elysia, t } from "elysia";
import { AnimeService, unauthorizedError } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  ArchiveSearchQuery,
  ArchiveSearchDto,
  AnimeDto,
  HeroCurationDto,
  SuccessCountDto,
  UpsertAnimeBody,
  UpsertAnimeDto,
} from "@anilog/api";

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
      response: t.Array(HeroCurationDto),
    },
  )
  .get(
    "/trending",
    async () => {
      return AnimeService.getTrendingAnime();
    },
    {
      response: t.Array(AnimeDto),
    },
  )
  .get(
    "/sync",
    async ({ request }) => {
      if (!isCronAuthorized(request)) {
        throw unauthorizedError("Unauthorized");
      }
      return AnimeService.syncTrendingAnime();
    },
    {
      response: SuccessCountDto,
    },
  )
  // .get( //TODO: add sync all route that syncs only releasing or upcoming anime
  //   "/sync-all",
  //   async ({ request }) => {
  //     if (!isCronAuthorized(request)) {
  //       throw unauthorizedError("Unauthorized");
  //     }
  //     return AnimeService.syncAllAnime();
  //   },
  //   {
  //     response: SuccessCountDto,
  //   },
  // )
  .get(
    "/search/:query",
    async ({ params }) => {
      return AnimeService.searchAnime(params.query);
    },
    {
      params: t.Object({ query: t.String() }),
      response: t.Array(AnimeDto),
    },
  )
  .get(
    "/archive-search",
    async ({ request, query }) => {
      const session = await auth.api.getSession({ headers: request.headers });
      if (!session?.user?.id) {
        throw unauthorizedError("User not authenticated");
      }

      const q = query.q?.trim() ?? "";
      const limit = query.limit ?? 12;

      return AnimeService.searchArchive(session.user.id, q, limit);
    },
    {
      query: ArchiveSearchQuery,
      response: ArchiveSearchDto,
    },
  )
  .post(
    "/upsert",
    async ({ body }) => {
      return AnimeService.upsertAnime(body);
    },
    {
      body: UpsertAnimeBody,
      response: UpsertAnimeDto,
    },
  );
