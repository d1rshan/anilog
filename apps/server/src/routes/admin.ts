import { Elysia, t } from "elysia";
import { AnimeService, UserService } from "@anilog/api";
import { auth } from "@anilog/auth";

type RouteSet = { status?: number | string };

async function requireAdmin(request: Request, set: RouteSet) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    set.status = 401;
    return null;
  }

  const isAdmin = await UserService.getAdminStatus(session.user.id);
  if (!isAdmin) {
    set.status = 403;
    return null;
  }

  return { userId: session.user.id };
}

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .get("/stats", async ({ request, set }) => {
    const admin = await requireAdmin(request, set);
    if (!admin) {
      return { error: "Forbidden" };
    }
    return UserService.getAdminStats();
  })
  .get(
    "/users",
    async ({ request, set, query }) => {
      const admin = await requireAdmin(request, set);
      if (!admin) {
        return { error: "Forbidden" };
      }

      const q = query.q?.trim() ?? "";
      return UserService.searchUsersForAdmin(q, {
        limit: query.limit,
        offset: query.offset,
      });
    },
    {
      query: t.Object({
        q: t.Optional(t.String()),
        limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
        offset: t.Optional(t.Integer({ minimum: 0 })),
      }),
    },
  )
  .patch(
    "/users/:id/admin",
    async ({ request, params, body, set }) => {
      const admin = await requireAdmin(request, set);
      if (!admin) {
        return { error: "Forbidden" };
      }

      try {
        return await UserService.setUserAdminStatus(params.id, body.isAdmin, admin.userId);
      } catch (error) {
        if (error instanceof Error && error.message === "User not found") {
          set.status = 404;
        } else if (error instanceof Error && error.message.includes("cannot remove your own")) {
          set.status = 400;
        } else {
          set.status = 500;
        }
        return { error: error instanceof Error ? error.message : "Failed to update admin status" };
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        isAdmin: t.Boolean(),
      }),
    },
  )
  .get("/hero-curations", async ({ request, set }) => {
    const admin = await requireAdmin(request, set);
    if (!admin) {
      return { error: "Forbidden" };
    }

    return AnimeService.getHeroCurationsForAdmin();
  })
  .patch(
    "/hero-curations/:id",
    async ({ request, params, body, set }) => {
      const admin = await requireAdmin(request, set);
      if (!admin) {
        return { error: "Forbidden" };
      }

      try {
        return await AnimeService.updateHeroCuration(params.id, body);
      } catch (error) {
        if (error instanceof Error && error.message === "Hero curation not found") {
          set.status = 404;
        } else if (error instanceof Error && error.message.toLowerCase().includes("timestamp")) {
          set.status = 400;
        } else if (error instanceof Error && error.message.toLowerCase().includes("required")) {
          set.status = 400;
        } else {
          set.status = 500;
        }
        return { error: error instanceof Error ? error.message : "Failed to update hero curation" };
      }
    },
    {
      params: t.Object({
        id: t.Integer(),
      }),
      body: t.Object({
        videoId: t.String(),
        start: t.Integer({ minimum: 0 }),
        stop: t.Integer({ minimum: 1 }),
        title: t.String(),
        subtitle: t.String(),
        description: t.String(),
        tag: t.String(),
        sortOrder: t.Integer({ minimum: 0 }),
        isActive: t.Boolean(),
      }),
    },
  );
