import { Elysia, t } from "elysia";
import { LibraryService, unauthorizedError } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  libraryAnimeIdParamsSchema,
  libraryEntrySchema,
  logAnimeInputSchema,
  updateProgressInputSchema,
  updateRatingInputSchema,
  updateStatusInputSchema,
} from "../schemas";

const authMiddleware = (app: Elysia) =>
  app.derive(async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      throw unauthorizedError("User not authenticated");
    }
    return { userId: session.user.id };
  });

export const libraryRoutes = new Elysia({ prefix: "/library" })
  .use(authMiddleware)
  .get(
    "/me",
    async ({ userId }) => {
      return LibraryService.getUserLibrary(userId);
    },
    {
      response: t.Array(libraryEntrySchema),
    },
  )
  .post(
    "/me/log",
    async ({ userId, body }) => {
      return LibraryService.logAnime(userId, body);
    },
    {
      body: logAnimeInputSchema,
      response: libraryEntrySchema,
    },
  )
  .patch(
    "/me/:animeId/status",
    async ({ userId, params, body }) => {
      return LibraryService.updateStatus(userId, params.animeId, body.status, body.currentEpisode);
    },
    {
      params: libraryAnimeIdParamsSchema,
      body: updateStatusInputSchema,
      response: libraryEntrySchema,
    },
  )
  .patch(
    "/me/:animeId/progress",
    async ({ userId, params, body }) => {
      return LibraryService.updateProgress(userId, params.animeId, body);
    },
    {
      params: libraryAnimeIdParamsSchema,
      body: updateProgressInputSchema,
      response: libraryEntrySchema,
    },
  )
  .patch(
    "/me/:animeId/rating",
    async ({ userId, params, body }) => {
      return LibraryService.updateRating(userId, params.animeId, body.rating);
    },
    {
      params: libraryAnimeIdParamsSchema,
      body: updateRatingInputSchema,
      response: libraryEntrySchema,
    },
  )
  .delete(
    "/me/:animeId",
    async ({ userId, params }) => {
      return LibraryService.removeFromLibrary(userId, params.animeId);
    },
    {
      params: libraryAnimeIdParamsSchema,
      response: t.Boolean(),
    },
  );
