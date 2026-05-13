import { queryOptions } from "@tanstack/react-query";
import type {
  AdminUsersQuery,
  HeroCurationDto,
  HeroCurationParams,
  SetUserAdminStatusBody,
  UpdateHeroCurationBody,
  UserParams,
} from "@anilog/contracts";
import { api } from "@/lib/api";
import { edenFetch } from "@/lib/eden-fetch";
import { adminKeys } from "./admin.keys";

const SECOND = 1000;

const adminClient = {
  getStats: () => edenFetch(() => api.admin.stats.get()),
  getUsers: (query?: AdminUsersQuery) => edenFetch(() => api.admin.users.get({ query })),
  getHeroCurations: () => edenFetch(() => api.admin["hero-curations"].get()),
  setAdminStatus: (params: UserParams, body: SetUserAdminStatusBody) =>
    edenFetch(() => api.admin.users(params).admin.patch(body)),
  updateHeroCuration: (params: HeroCurationParams, body: UpdateHeroCurationBody) =>
    edenFetch(() => api.admin["hero-curations"](params).patch(body)),
};

export const adminQueries = {
  stats: () =>
    queryOptions({
      queryKey: adminKeys.stats(),
      queryFn: adminClient.getStats,
      staleTime: 30 * SECOND,
    }),

  users: ({ query }: { query?: AdminUsersQuery } = {}) =>
    queryOptions({
      queryKey: adminKeys.users(query?.q ?? "", query?.limit ?? 20, query?.offset ?? 0),
      queryFn: () => adminClient.getUsers(query),
      staleTime: 30 * SECOND,
    }),

  heroCurations: () =>
    queryOptions({
      queryKey: adminKeys.heroCurations(),
      queryFn: adminClient.getHeroCurations,
      staleTime: 30 * SECOND,
    }),
};

export const adminMutations = {
  setAdminStatus: () => ({
    mutationFn: ({ params, body }: { params: UserParams; body: SetUserAdminStatusBody }) =>
      adminClient.setAdminStatus(params, body),
  }),

  updateHeroCuration: () => ({
    mutationFn: ({ params, body }: { params: HeroCurationParams; body: UpdateHeroCurationBody }) =>
      adminClient.updateHeroCuration(params, body),
  }),
};

export type AdminUsersQueryInput = {
  query?: AdminUsersQuery;
};

export type HeroCuration = HeroCurationDto;
