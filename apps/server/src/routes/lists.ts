import { Elysia, t } from "elysia";
import { ListService } from "@anilog/api";
import { auth } from "@anilog/auth";

const authMiddleware = (app: Elysia) => app.derive(async ({ request }) => {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    throw new Error("User not authenticated");
  }
  return { userId: session.user.id };
});

export const listRoutes = new Elysia({ prefix: "/lists" })
  .use(authMiddleware)
  .get("/", async ({ userId }) => {
    return await ListService.getUserListsWithEntries(userId);
  })
  .post("/", async ({ body, userId }) => {
    return await ListService.createList(userId, body.name);
  }, {
    body: t.Object({ name: t.String() })
  })
  .put("/:id", async ({ params, body }) => {
    return await ListService.updateList(params.id, body.name);
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({ name: t.String() })
  })
  .delete("/:id", async ({ params }) => {
    return await ListService.deleteList(params.id);
  }, {
    params: t.Object({ id: t.String() })
  })
  .post("/:id/anime", async ({ params, body }) => {
    return await ListService.addAnimeToList(params.id, body.animeId, body.currentEpisode, body.rating);
  }, {
    params: t.Object({ id: t.String() }),
    body: t.Object({
      animeId: t.Integer(),
      currentEpisode: t.Optional(t.Integer()),
      rating: t.Optional(t.Integer())
    })
  })
  .put("/entries/:entryId", async ({ params, body }) => {
    return await ListService.updateListEntry(params.entryId, body.currentEpisode, body.rating);
  }, {
    params: t.Object({ entryId: t.String() }),
    body: t.Object({
      currentEpisode: t.Optional(t.Integer()),
      rating: t.Optional(t.Integer())
    })
  })
  .delete("/entries/:entryId", async ({ params }) => {
    return await ListService.removeAnimeFromList(params.entryId);
  }, {
    params: t.Object({ entryId: t.String() })
  })
  .post("/favorites", async ({ body, userId }) => {
    return await ListService.addToFavorites(userId, body.animeId);
  }, {
    body: t.Object({ animeId: t.Integer() })
  })
  .delete("/favorites", async ({ body, userId }) => {
    return await ListService.removeFromFavorites(userId, body.animeId);
  }, {
    body: t.Object({ animeId: t.Integer() })
  });
