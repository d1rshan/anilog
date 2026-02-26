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

const adminMiddleware = (app: Elysia) =>
  app.derive(async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      throw unauthorizedError("User not authenticated");
    }

    const isAdmin = await UserService.getAdminStatus(session.user.id);
    if (!isAdmin) {
      throw forbiddenError("Forbidden");
    }

    return { adminUserId: session.user.id };
  });

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(adminMiddleware)
  .get(
    "/stats",
    async () => {
      return UserService.getAdminStats();
    },
    {
      response: adminStatsSchema,
    },
  )
  .get(
    "/users",
    async ({ query }) => {
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
    async ({ params, body, adminUserId }) => {
      return UserService.setUserAdminStatus(params.id, body.isAdmin, adminUserId);
    },
    {
      params: userIdParamsSchema,
      body: setAdminStatusInputSchema,
      response: setAdminStatusResultSchema,
    },
  )
  .get(
    "/hero-curations",
    async () => {
      return AnimeService.getHeroCurationsForAdmin();
    },
    {
      response: t.Array(heroCurationSchema),
    },
  )
  .patch(
    "/hero-curations/:id",
    async ({ params, body }) => {
      return AnimeService.updateHeroCuration(params.id, body);
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: updateHeroCurationInputSchema,
      response: heroCurationSchema,
    },
  );
