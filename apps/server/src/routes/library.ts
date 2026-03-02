import { Elysia, t } from "elysia";
import { LibraryService, unauthorizedError } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  LibraryAnimeParams,
  LibraryEntryDto,
  LogAnimeBody,
  UpdateLibraryProgressBody,
  UpdateLibraryRatingBody,
  UpdateLibraryStatusBody,
} from "@anilog/api";

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
      response: t.Array(LibraryEntryDto),
    },
  )
  .post(
    "/me/log",
    async ({ userId, body }) => {
      return LibraryService.logAnime(userId, body);
    },
    {
      body: LogAnimeBody,
      response: LibraryEntryDto,
    },
  )
  .patch(
    "/me/:animeId/status",
    async ({ userId, params, body }) => {
      return LibraryService.updateStatus(userId, params.animeId, body);
    },
    {
      params: LibraryAnimeParams,
      body: UpdateLibraryStatusBody,
      response: LibraryEntryDto,
    },
  )
  .patch(
    "/me/:animeId/progress",
    async ({ userId, params, body }) => {
      return LibraryService.updateProgress(userId, params.animeId, body);
    },
    {
      params: LibraryAnimeParams,
      body: UpdateLibraryProgressBody,
      response: LibraryEntryDto,
    },
  )
  .patch(
    "/me/:animeId/rating",
    async ({ userId, params, body }) => {
      return LibraryService.updateRating(userId, params.animeId, body.rating);
    },
    {
      params: LibraryAnimeParams,
      body: UpdateLibraryRatingBody,
      response: LibraryEntryDto,
    },
  )
  .delete(
    "/me/:animeId",
    async ({ userId, params }) => {
      return LibraryService.removeFromLibrary(userId, params.animeId);
    },
    {
      params: LibraryAnimeParams,
      response: t.Boolean(),
    },
  );
