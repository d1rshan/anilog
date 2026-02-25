import { Elysia, t } from "elysia";
import { LibraryService } from "@anilog/api";
import { auth } from "@anilog/auth";

type LogAnimeInput = Parameters<typeof LibraryService.logAnime>[1];

type UpdateStatusInput = {
  status: Parameters<typeof LibraryService.updateStatus>[2];
  currentEpisode?: Parameters<typeof LibraryService.updateStatus>[3];
};

type UpdateProgressInput = Parameters<typeof LibraryService.updateProgress>[2];

type UpdateRatingInput = {
  rating: Parameters<typeof LibraryService.updateRating>[2];
};

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
      return await LibraryService.logAnime(userId, body as LogAnimeInput);
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
      const payload = body as UpdateStatusInput;
      return await LibraryService.updateStatus(
        userId,
        Number(params.animeId),
        payload.status,
        payload.currentEpisode,
      );
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
      return await LibraryService.updateProgress(
        userId,
        Number(params.animeId),
        body as UpdateProgressInput,
      );
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
      const payload = body as UpdateRatingInput;
      return await LibraryService.updateRating(userId, Number(params.animeId), payload.rating);
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
      return await LibraryService.removeFromLibrary(userId, Number(params.animeId));
    },
    {
      params: t.Object({ animeId: t.Integer() }),
    },
  );
