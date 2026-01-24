import { Elysia, t } from "elysia";
import { ListService } from "@anilog/api";
import { auth } from "@anilog/auth";

const authMiddleware = (app: Elysia) => app.derive(async ({ request }) => {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }
    return { userId: session.user.id };
  } catch (error) {
    throw new Error("User not authenticated");
  }
});

export const listRoutes = new Elysia({ prefix: "/lists" })
  .use(authMiddleware)
  .get("/", async ({ userId }) => {
    // try {
    //   const lists = await ListService.getUserListsWithEntries(userId);
    //   return { success: true, data: lists };
    // } catch (error) {
    //   return {
    //     success: false,
    //     error: error instanceof Error ? error.message : "Failed to fetch lists"
    //   };
    // }
  })
  .post("/", async ({ body, userId }) => {
    // try {
    //   const list = await ListService.createList(userId, body);
    //   return { success: true, data: list };
    // } catch (error) {
    //   return {
    //     success: false,
    //     error: error instanceof Error ? error.message : "Failed to create list"
    //   };
    // }
  }, {
    body: t.Object({
      name: t.String(),
      type: t.Optional(t.Union([
        t.Literal("favorites"),
        t.Literal("watching"),
        t.Literal("completed"),
        t.Literal("planned"),
        t.Literal("dropped"),
        t.Literal("custom")
      ])),
      description: t.Optional(t.String())
    })
  })
  .put("/:id", async ({ params, body, userId }) => {
    try {
      const list = await ListService.updateList(params.id, userId, body);
      if (!list) {
        return { success: false, error: "List not found" };
      }
      return { success: true, data: list };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update list"
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      name: t.Optional(t.String()),
      description: t.Optional(t.String())
    })
  })
  .delete("/:id", async ({ params, userId }) => {
    try {
      const success = await ListService.deleteList(params.id, userId);
      if (!success) {
        return { success: false, error: "List not found" };
      }
      return { success: true, message: "List deleted successfully" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete list"
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .post("/:id/anime", async ({ params, body, userId }) => {
    // try {
    //   const entry = await ListService.addAnimeToList(params.id, userId, body);
    //   return { success: true, data: entry };
    // } catch (error) {
    //   return {
    //     success: false,
    //     error: error instanceof Error ? error.message : "Failed to add anime to list"
    //   };
    // }
  }, {
    params: t.Object({
      id: t.String()
    }),
    body: t.Object({
      animeId: t.String(),
      currentEpisode: t.Optional(t.Number()),
      rating: t.Optional(t.Number()),
      notes: t.Optional(t.String())
    })
  })
  .put("/entries/:entryId", async ({ params, body, userId }) => {
    try {
      const entry = await ListService.updateListEntry(params.entryId, userId, body);
      if (!entry) {
        return { success: false, error: "Entry not found" };
      }
      return { success: true, data: entry };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update entry"
      };
    }
  }, {
    params: t.Object({
      entryId: t.String()
    }),
    body: t.Object({
      currentEpisode: t.Optional(t.Number()),
      rating: t.Optional(t.Number()),
      notes: t.Optional(t.String())
    })
  })
  .delete("/entries/:entryId", async ({ params, userId }) => {
    try {
      const success = await ListService.removeAnimeFromList(params.entryId, userId);
      if (!success) {
        return { success: false, error: "Entry not found" };
      }
      return { success: true, message: "Anime removed from list" };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to remove anime from list"
      };
    }
  }, {
    params: t.Object({
      entryId: t.String()
    })
  })
  .post("/initialize", async ({ userId }) => {
    try {
      const lists = await ListService.createDefaultLists(userId);
      return { success: true, data: lists };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to initialize default lists"
      };
    }
  });
