import { Elysia, t } from "elysia";
import { AnimeService, UserService, forbiddenError, unauthorizedError } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  adminUsersQuerySchema,
  adminStatsSchema,
  adminUsersResultSchema,
  heroCurationSchema,
  setAdminStatusInputSchema,
  setAdminStatusResultSchema,
  userIdParamsSchema,
  updateHeroCurationInputSchema,
} from "../schemas";

async function requireAdmin(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    throw unauthorizedError("User not authenticated");
  }

  const isAdmin = await UserService.getAdminStatus(session.user.id);
  if (!isAdmin) {
    throw forbiddenError("Forbidden");
  }

  return { userId: session.user.id };
}

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .get(
    "/stats",
    async ({ request }) => {
      await requireAdmin(request);
      return UserService.getAdminStats();
    },
    {
      response: adminStatsSchema,
    },
  )
  .get(
    "/users",
    async ({ request, query }) => {
      await requireAdmin(request);

      const q = query.q?.trim() ?? "";
      return UserService.searchUsersForAdmin(q, {
        limit: query.limit,
        offset: query.offset,
      });
    },
    {
      query: adminUsersQuerySchema,
      response: adminUsersResultSchema,
    },
  )
  .patch(
    "/users/:id/admin",
    async ({ request, params, body }) => {
      const admin = await requireAdmin(request);
      return UserService.setUserAdminStatus(params.id, body.isAdmin, admin.userId);
    },
    {
      params: userIdParamsSchema,
      body: setAdminStatusInputSchema,
      response: setAdminStatusResultSchema,
    },
  )
  .get(
    "/hero-curations",
    async ({ request }) => {
      await requireAdmin(request);
      return AnimeService.getHeroCurationsForAdmin();
    },
    {
      response: t.Array(heroCurationSchema),
    },
  )
  .patch(
    "/hero-curations/:id",
    async ({ request, params, body }) => {
      await requireAdmin(request);
      return AnimeService.updateHeroCuration(params.id, body);
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: updateHeroCurationInputSchema,
      response: heroCurationSchema,
    },
  );
