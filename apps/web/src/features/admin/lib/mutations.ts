import { api } from "@/lib/api";
import { edenMutationOptions } from "@/lib/eden-query";

type AdminHeroCurationsRoute = ReturnType<(typeof api.admin)["hero-curations"]>;
type HeroCurationUpdateInput = Parameters<AdminHeroCurationsRoute["patch"]>[0];

export const adminMutations = {
  setAdminStatus: () =>
    edenMutationOptions({
      mutationFn: (input: { userId: string; isAdmin: boolean }) =>
        api.admin.users({ id: input.userId }).admin.patch({
          isAdmin: input.isAdmin,
        }),
    }),

  updateHeroCuration: () =>
    edenMutationOptions({
      mutationFn: (input: { id: number; data: HeroCurationUpdateInput }) =>
        api.admin["hero-curations"]({ id: input.id }).patch(input.data),
    }),
};
