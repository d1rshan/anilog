import { Elysia, t } from "elysia";
import {
  AdminStatsDto,
  AdminUsersDto,
  AdminUsersQuery,
  HeroCurationDto,
  HeroCurationParams,
  SetUserAdminStatusBody,
  SetUserAdminStatusDto,
  UpdateHeroCurationBody,
  UserParams,
} from "@anilog/contracts";
import { adminPlugin } from "../../plugins/admin.plugin";
import { AdminService } from "./admin.service";

export const adminRoutes = new Elysia({ prefix: "/admin" })
  .use(adminPlugin)
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
      return AdminService.searchUsers(query);
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
      params: HeroCurationParams,
      body: UpdateHeroCurationBody,
      response: HeroCurationDto,
    },
  );
