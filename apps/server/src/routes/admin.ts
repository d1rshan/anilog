import { Elysia, t } from "elysia";
import { AnimeService, UserService } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  adminUsersQuerySchema,
  adminStatsSchema,
  adminUsersResultSchema,
  errorResponseSchema,
  heroCurationSchema,
  setAdminStatusInputSchema,
  setAdminStatusResultSchema,
  userIdParamsSchema,
  updateHeroCurationInputSchema,
} from "../schemas";

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
  .get(
    "/stats",
    async ({ request, set }) => {
      const admin = await requireAdmin(request, set);
      if (!admin) {
        return { error: "Forbidden" };
      }
      return UserService.getAdminStats();
    },
    {
      response: {
        200: adminStatsSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
      },
    },
  )
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
      query: adminUsersQuerySchema,
      response: {
        200: adminUsersResultSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
      },
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
      params: userIdParamsSchema,
      body: setAdminStatusInputSchema,
      response: {
        200: setAdminStatusResultSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
  )
  .get(
    "/hero-curations",
    async ({ request, set }) => {
      const admin = await requireAdmin(request, set);
      if (!admin) {
        return { error: "Forbidden" };
      }

      return AnimeService.getHeroCurationsForAdmin();
    },
    {
      response: {
        200: t.Array(heroCurationSchema),
        401: errorResponseSchema,
        403: errorResponseSchema,
      },
    },
  )
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
      params: t.Object({ id: t.Numeric() }),
      body: updateHeroCurationInputSchema,
      response: {
        200: heroCurationSchema,
        400: errorResponseSchema,
        401: errorResponseSchema,
        403: errorResponseSchema,
        404: errorResponseSchema,
        500: errorResponseSchema,
      },
    },
  );
