import { Elysia, t } from "elysia";
import {
  LibraryAnimeParams,
  LibraryEntryDto,
  LogAnimeBody,
  UpdateLibraryProgressBody,
  UpdateLibraryRatingBody,
  UpdateLibraryStatusBody,
} from "@anilog/contracts";
import { authPlugin } from "../../plugins/auth.plugin";
import { LibraryService } from "./library.service";

export const libraryRoutes = new Elysia({ prefix: "/library" })
  .use(authPlugin)
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
      return LibraryService.updateRating(userId, params.animeId, body);
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
