import { Elysia, t } from "elysia";
import { AdminService, UserService, forbiddenError, unauthorizedError } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  AdminUsersQuery,
  AdminStatsDto,
  AdminUsersDto,
  HeroCurationDto,
  SetUserAdminStatusBody,
  SetUserAdminStatusDto,
  UserParams,
  UpdateHeroCurationBody,
} from "@anilog/api";

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
      return AdminService.getAdminStats();
    },
    {
      response: AdminStatsDto,
    },
  )
  .get(
    "/users",
    async ({ query }) => {
      const q = query.q?.trim() ?? "";
      return AdminService.searchUsers(q, {
        limit: query.limit,
        offset: query.offset,
      });
    },
    {
      query: AdminUsersQuery,
      response: AdminUsersDto,
    },
  )
  .patch(
    "/users/:id/admin",
    async ({ params, body, adminUserId }) => {
      return AdminService.setUserAdminStatus(params.id, body.isAdmin, adminUserId);
    },
    {
      params: UserParams,
      body: SetUserAdminStatusBody,
      response: SetUserAdminStatusDto,
    },
  )
  .get(
    "/hero-curations",
    async () => {
      return AdminService.getHeroCurationsForAdmin();
    },
    {
      response: t.Array(HeroCurationDto),
    },
  )
  .patch(
    "/hero-curations/:id",
    async ({ params, body }) => {
      return AdminService.updateHeroCuration(params.id, body);
    },
    {
      params: t.Object({ id: t.Numeric() }),
      body: UpdateHeroCurationBody,
      response: HeroCurationDto,
    },
  );
