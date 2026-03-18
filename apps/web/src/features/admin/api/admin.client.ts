import { api } from "@/lib/api";
import { edenFetch } from "@/lib/eden-fetch";
import type {
  AdminUsersQuery,
  HeroCurationParams,
  SetUserAdminStatusBody,
  UpdateHeroCurationBody,
  UserParams,
} from "@anilog/contracts";

export const adminClient = {
  getStats: () => edenFetch(() => api.admin.stats.get()),
  getUsers: (query?: AdminUsersQuery) => edenFetch(() => api.admin.users.get({ query })),
  getHeroCurations: () => edenFetch(() => api.admin["hero-curations"].get()),
  setAdminStatus: (params: UserParams, body: SetUserAdminStatusBody) =>
    edenFetch(() => api.admin.users(params).admin.patch(body)),
  updateHeroCuration: (params: HeroCurationParams, body: UpdateHeroCurationBody) =>
    edenFetch(() => api.admin["hero-curations"](params).patch(body)),
};
