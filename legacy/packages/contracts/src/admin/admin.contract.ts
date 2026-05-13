import { t } from "elysia";

import { UserWithProfileDto } from "../users/users.contract";

export const AdminStatsDto = t.Object({
  totalUsers: t.Integer(),
});

export const AdminUsersQuery = t.Object({
  q: t.Optional(t.String()),
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
  offset: t.Optional(t.Integer({ minimum: 0 })),
});

export const AdminUsersDto = t.Object({
  users: t.Array(UserWithProfileDto),
  total: t.Integer(),
  limit: t.Integer(),
  offset: t.Integer(),
});

export const SetUserAdminStatusBody = t.Object({
  isAdmin: t.Boolean(),
});

export const SetUserAdminStatusDto = t.Object({
  id: t.String(),
  isAdmin: t.Boolean(),
});

export const AdminStatusDto = t.Object({
  isAdmin: t.Boolean(),
});

export const UpdateHeroCurationBody = t.Object({
  videoId: t.String(),
  start: t.Integer({ minimum: 0 }),
  stop: t.Integer({ minimum: 1 }),
  title: t.String(),
  subtitle: t.String(),
  description: t.String(),
  tag: t.String(),
  sortOrder: t.Integer({ minimum: 0 }),
  isActive: t.Boolean(),
});

export type AdminStatsDto = (typeof AdminStatsDto)["static"];
export type AdminUsersQuery = (typeof AdminUsersQuery)["static"];
export type AdminUsersDto = (typeof AdminUsersDto)["static"];
export type SetUserAdminStatusBody = (typeof SetUserAdminStatusBody)["static"];
export type SetUserAdminStatusDto = (typeof SetUserAdminStatusDto)["static"];
export type AdminStatusDto = (typeof AdminStatusDto)["static"];
export type UpdateHeroCurationBody = (typeof UpdateHeroCurationBody)["static"];
