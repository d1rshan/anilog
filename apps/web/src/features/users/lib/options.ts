import { api } from "@/lib/api";
import { edenFetch } from "@/lib/eden-fetch";
import { createQueryOptions, createMutationOptions } from "@/lib/query-helpers";
import { libraryKeys, userKeys } from "@/lib/query-keys";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export type UpdateProfileData = Parameters<typeof api.users.me.profile.put>[0];

export const userQueries = {
  search: (query: string) =>
    createQueryOptions(
      userKeys.search(query),
      () => api.users.search.get({ query: { q: query } }),
      { staleTime: 30 * SECOND },
    ),

  profile: (userId: string) =>
    createQueryOptions(userKeys.profile(userId), () => api.users({ id: userId }).get(), {
      staleTime: 1 * MINUTE,
    }),

  byUsername: (username: string) =>
    createQueryOptions(
      userKeys.byUsername(username),
      () => api.users.username({ username }).get(),
      { staleTime: 1 * MINUTE },
    ),

  publicLibrary: (userId: string) =>
    createQueryOptions(
      libraryKeys.publicByUserId(userId),
      () => api.users({ id: userId }).library.get(),
      { staleTime: 1 * MINUTE },
    ),

  isFollowing: (userId: string) => ({
    queryKey: userKeys.isFollowing(userId),
    queryFn: async () => {
      const data = await edenFetch(() => api.users.me["check-follow"]({ id: userId }).get());
      return { isFollowing: data.isFollowing };
    },
    staleTime: 30 * SECOND,
  }),

  myFollowing: () =>
    createQueryOptions(userKeys.following(), () => api.users.me.following.get(), {
      staleTime: 1 * MINUTE,
    }),

  myProfile: () =>
    createQueryOptions(userKeys.meProfile(), () => api.users.me.profile.get(), {
      staleTime: 1 * MINUTE,
    }),

  myAdminStatus: () =>
    createQueryOptions(userKeys.meAdminStatus(), () => api.users.me["admin-status"].get(), {
      staleTime: 30 * SECOND,
    }),
};

export const userMutations = {
  follow: () =>
    createMutationOptions(
      (userId: string) => api.users({ id: userId }).follow.post(),
      "user.follow",
    ),

  unfollow: () =>
    createMutationOptions(
      (userId: string) => api.users({ id: userId }).follow.delete(),
      "user.unfollow",
    ),

  updateMyProfile: () =>
    createMutationOptions(
      (data: UpdateProfileData) => api.users.me.profile.put(data),
      "user.profile.update",
    ),
};

type UserProfileData = NonNullable<
  Awaited<ReturnType<ReturnType<typeof api.users>["get"]>>["data"]
>;
type UserPublicLibraryData = NonNullable<
  Awaited<ReturnType<ReturnType<typeof api.users>["library"]["get"]>>["data"]
>;

export type UserWithProfile = UserProfileData;
export type PublicUserLibrary = UserPublicLibraryData;
