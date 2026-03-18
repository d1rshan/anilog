import { api } from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";
import type {
  AdminUsersQuery,
  HeroCurationParams,
  SetUserAdminStatusBody,
  UpdateHeroCurationBody,
  UserParams,
} from "@anilog/contracts";
import { edenFetch } from "@/lib/eden-fetch";
import { adminKeys } from "@/lib/query-keys";

const SECOND = 1000;

export type AdminUsersQueryInput = {
  query?: AdminUsersQuery;
};

export const adminQueries = {
  stats: () =>
    queryOptions({
      queryKey: adminKeys.stats(),
      queryFn: () => edenFetch(() => api.admin.stats.get()),
      staleTime: 30 * SECOND,
    }),

  users: ({ query }: AdminUsersQueryInput = {}) =>
    queryOptions({
      queryKey: adminKeys.users(query?.q ?? "", query?.limit ?? 20, query?.offset ?? 0),
      queryFn: () =>
        edenFetch(() =>
          api.admin.users.get({
            query,
          }),
        ),
      staleTime: 30 * SECOND,
    }),

  heroCurations: () =>
    queryOptions({
      queryKey: adminKeys.heroCurations(),
      queryFn: () => edenFetch(() => api.admin["hero-curations"].get()),
      staleTime: 30 * SECOND,
    }),
};

export const adminMutations = {
  setAdminStatus: () => ({
    mutationFn: ({ params, body }: { params: UserParams; body: SetUserAdminStatusBody }) =>
      edenFetch(() => api.admin.users(params).admin.patch(body)),
  }),

  updateHeroCuration: () => ({
    mutationFn: ({ params, body }: { params: HeroCurationParams; body: UpdateHeroCurationBody }) =>
      edenFetch(() => api.admin["hero-curations"](params).patch(body)),
  }),
};
