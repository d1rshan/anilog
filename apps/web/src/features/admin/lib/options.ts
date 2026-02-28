import { api } from "@/lib/api";
import { createQueryOptions, createMutationOptions } from "@/lib/query-helpers";
import { adminKeys } from "@/lib/query-keys";

const SECOND = 1000;

type HeroCurationUpdateInput = Parameters<
  ReturnType<(typeof api.admin)["hero-curations"]>["patch"]
>[0];

export const adminQueries = {
  stats: () =>
    createQueryOptions(adminKeys.stats(), () => api.admin.stats.get(), {
      staleTime: 30 * SECOND,
    }),

  users: (query: string, limit: number, offset: number) =>
    createQueryOptions(
      adminKeys.users(query, limit, offset),
      () => api.admin.users.get({ query: { q: query, limit, offset } }),
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
      (input: { userId: string; isAdmin: boolean }) =>
        api.admin.users({ id: input.userId }).admin.patch({ isAdmin: input.isAdmin }),
      "admin.status.update",
    ),

  updateHeroCuration: () =>
    createMutationOptions(
      (input: any) => api.admin["hero-curations"]({ id: input.id }).patch(input.data),
      "admin.hero-curation.update",
    ),
};
