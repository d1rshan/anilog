import { t } from "elysia";
import { userWithProfileSchema } from "./common";

export const adminStatsSchema = t.Object({
  totalUsers: t.Integer(),
});

export const adminUsersQuerySchema = t.Object({
  q: t.Optional(t.String()),
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Integer({ minimum: 0 })),
});

export const adminUsersResultSchema = t.Object({
  users: t.Array(userWithProfileSchema),
  total: t.Integer(),
  limit: t.Integer(),
  offset: t.Integer(),
});

export const setAdminStatusInputSchema = t.Object({
  isAdmin: t.Boolean(),
});

export const setAdminStatusResultSchema = t.Object({
  id: t.String(),
  isAdmin: t.Boolean(),
});
