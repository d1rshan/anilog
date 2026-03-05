import { api } from "@/lib/api";
import type {
  AdminUsersQuery,
  HeroCurationParams,
  SetUserAdminStatusBody,
  UpdateHeroCurationBody,
  UserParams,
} from "@anilog/api";
import { createQueryOptions, createMutationOptions } from "@/lib/query-helpers";
import { adminKeys } from "@/lib/query-keys";

const SECOND = 1000;

export const adminQueries = {
  stats: () =>
    createQueryOptions(adminKeys.stats(), () => api.admin.stats.get(), {
      staleTime: 30 * SECOND,
    }),

  users: ({ query }: { query?: AdminUsersQuery } = {}) =>
    createQueryOptions(
      adminKeys.users(query?.q ?? "", query?.limit ?? 20, query?.offset ?? 0),
      () =>
        api.admin.users.get({
          query,
        }),
      { staleTime: 30 * SECOND },
    ),

  heroCurations: () =>
    createQueryOptions(adminKeys.heroCurations(), () => api.admin["hero-curations"].get(), {
      staleTime: 30 * SECOND,
    }),
};

export const adminMutations = {
  setAdminStatus: () =>
    createMutationOptions(
      ({ params, body }: { params: UserParams; body: SetUserAdminStatusBody }) =>
        api.admin.users(params).admin.patch(body),
      "admin.status.update",
    ),

  updateHeroCuration: () =>
    createMutationOptions(
      ({ params, body }: { params: HeroCurationParams; body: UpdateHeroCurationBody }) =>
        api.admin["hero-curations"](params).patch(body),
      "admin.hero-curation.update",
    ),
};
