import { Elysia, t } from "elysia";
import { LibraryService } from "@anilog/api";
import { auth } from "@anilog/auth";

const authMiddleware = (app: Elysia) =>
  app.derive(async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }
    return { userId: session.user.id };
  });

const libraryStatus = t.Union([
  t.Literal("watching"),
  t.Literal("completed"),
  t.Literal("planned"),
  t.Literal("dropped"),
]);

export const libraryRoutes = new Elysia({ prefix: "/library" })
  .use(authMiddleware)
  .get("/me", async ({ userId }) => {
    return await LibraryService.getUserLibrary(userId);
  })
  .post(
    "/me/log",
    async ({ userId, body }) => {
      return await LibraryService.logAnime(userId, body);
    },
    {
      body: t.Object({
        anime: t.Object({
          id: t.Integer(),
          title: t.String(),
          titleJapanese: t.Optional(t.Nullable(t.String())),
          description: t.Optional(t.Nullable(t.String())),
          episodes: t.Optional(t.Nullable(t.Integer())),
          status: t.Optional(t.Nullable(t.String())),
          genres: t.Optional(t.Nullable(t.Array(t.String()))),
          imageUrl: t.String(),
          year: t.Optional(t.Nullable(t.Integer())),
          rating: t.Optional(t.Nullable(t.Integer())),
        }),
        status: libraryStatus,
        currentEpisode: t.Optional(t.Integer({ minimum: 0 })),
        rating: t.Optional(t.Nullable(t.Integer({ minimum: 1, maximum: 5 }))),
      }),
    },
  )
  .patch(
    "/me/:animeId/status",
    async ({ userId, params, body }) => {
      return await LibraryService.updateStatus(userId, params.animeId, body.status, body.currentEpisode);
    },
    {
      params: t.Object({ animeId: t.Integer() }),
      body: t.Object({
        status: libraryStatus,
        currentEpisode: t.Optional(t.Integer({ minimum: 0 })),
      }),
    },
  )
  .patch(
    "/me/:animeId/progress",
    async ({ userId, params, body }) => {
      return await LibraryService.updateProgress(userId, params.animeId, body);
    },
    {
      params: t.Object({ animeId: t.Integer() }),
      body: t.Object({
        currentEpisode: t.Optional(t.Integer({ minimum: 1 })),
        delta: t.Optional(t.Integer()),
      }),
    },
  )
  .patch(
    "/me/:animeId/rating",
    async ({ userId, params, body }) => {
      return await LibraryService.updateRating(userId, params.animeId, body.rating);
    },
    {
      params: t.Object({ animeId: t.Integer() }),
      body: t.Object({
        rating: t.Nullable(t.Integer({ minimum: 1, maximum: 5 })),
      }),
    },
  )
  .delete(
    "/me/:animeId",
    async ({ userId, params }) => {
      return await LibraryService.removeFromLibrary(userId, params.animeId);
    },
    {
      params: t.Object({ animeId: t.Integer() }),
    },
  );
