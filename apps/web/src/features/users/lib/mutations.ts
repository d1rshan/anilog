import { api } from "@/lib/api";
import { edenMutationOptions } from "@/lib/eden-query";

export type UpdateProfileData = Parameters<typeof api.users.me.profile.put>[0];

export const userMutations = {
  follow: () =>
    edenMutationOptions({
      mutationFn: (userId: string) => api.users({ id: userId }).follow.post(),
    }),

  unfollow: () =>
    edenMutationOptions({
      mutationFn: (userId: string) => api.users({ id: userId }).follow.delete(),
    }),

  updateMyProfile: () =>
    edenMutationOptions({
      mutationFn: (data: UpdateProfileData) => api.users.me.profile.put(data),
    }),
};
