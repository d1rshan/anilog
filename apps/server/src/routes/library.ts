import { Elysia, t } from "elysia";
import { LibraryService } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  errorResponseSchema,
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
      throw new Error("User not authenticated");
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
      response: {
        200: t.Array(libraryEntrySchema),
      },
    },
  )
  .post(
    "/me/log",
    async ({ userId, body }) => {
      return LibraryService.logAnime(userId, body);
    },
    {
      body: logAnimeInputSchema,
      response: {
        200: libraryEntrySchema,
        400: errorResponseSchema,
      },
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
      response: {
        200: libraryEntrySchema,
        400: errorResponseSchema,
      },
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
      response: {
        200: libraryEntrySchema,
        400: errorResponseSchema,
      },
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
      response: {
        200: libraryEntrySchema,
        400: errorResponseSchema,
      },
    },
  )
  .delete(
    "/me/:animeId",
    async ({ userId, params }) => {
      return LibraryService.removeFromLibrary(userId, params.animeId);
    },
    {
      params: libraryAnimeIdParamsSchema,
      response: {
        200: t.Boolean(),
      },
    },
  );
