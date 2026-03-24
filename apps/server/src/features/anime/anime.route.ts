import { Elysia, t } from "elysia";
import {
  ArchiveSearchDto,
  ArchiveSearchQuery,
  AnimeDto,
  AnimeSearchParams,
  HeroCurationDto,
  SuccessCountDto,
  UpsertAnimeBody,
  UpsertAnimeDto,
} from "@anilog/contracts";
import { unauthorizedError } from "../../lib/api-error";
import { authPlugin } from "../../plugins/auth.plugin";
import { AnimeService } from "./anime.service";

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
  .get(
    "/search/:query",
    async ({ params }) => {
      return AnimeService.searchAnime(params.query);
    },
    {
      params: AnimeSearchParams,
      response: t.Array(AnimeDto),
    },
  )
  .group("", (app) =>
    app.use(authPlugin).get(
      "/archive-search",
      async ({ query, userId }) => {
        const q = query.q?.trim() ?? "";
        const limit = query.limit ?? 12;

        return AnimeService.searchArchive(userId, q, limit);
      },
      {
        query: ArchiveSearchQuery,
        response: ArchiveSearchDto,
      },
    ),
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
