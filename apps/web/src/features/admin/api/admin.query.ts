import { queryOptions } from "@tanstack/react-query";
import type { AdminUsersQuery } from "@anilog/contracts";
import { adminClient } from "./admin.client";
import { adminKeys } from "./admin.keys";

const SECOND = 1000;

export type AdminUsersQueryInput = {
  query?: AdminUsersQuery;
};

export const adminQueries = {
  stats: () =>
    queryOptions({
      queryKey: adminKeys.stats(),
      queryFn: adminClient.getStats,
      staleTime: 30 * SECOND,
    }),

  users: ({ query }: AdminUsersQueryInput = {}) =>
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
