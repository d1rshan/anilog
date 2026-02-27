import { api } from "@/lib/api";
import { edenQueryOptions } from "@/lib/eden-query";
import { unwrapEdenResponse } from "@/lib/eden";
import { queryOptions } from "@tanstack/react-query";
import { userKeys, libraryKeys } from "@/lib/query-keys";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export async function getUserProfile(userId: string) {
  const res = await api.users({ id: userId }).get();
  return unwrapEdenResponse(res);
}

export async function getUserPublicLibrary(userId: string) {
  const res = await api.users({ id: userId }).library.get();
  return unwrapEdenResponse(res);
}

export const userQueries = {
  search: (query: string) =>
    edenQueryOptions({
      queryKey: userKeys.search(query),
      queryFn: () => api.users.search.get({ query: { q: query } }),
      staleTime: 30 * SECOND,
    }),

  profile: (userId: string) =>
    edenQueryOptions({
      queryKey: userKeys.profile(userId),
      queryFn: () => api.users({ id: userId }).get(),
      staleTime: 1 * MINUTE,
    }),

  byUsername: (username: string) =>
    edenQueryOptions({
      queryKey: userKeys.byUsername(username),
      queryFn: () => api.users.username({ username }).get(),
      staleTime: 1 * MINUTE,
    }),

  publicLibrary: (userId: string) =>
    edenQueryOptions({
      queryKey: libraryKeys.publicByUserId(userId),
      queryFn: () => api.users({ id: userId }).library.get(),
      staleTime: 1 * MINUTE,
    }),

  isFollowing: (userId: string) =>
    queryOptions({
      queryKey: userKeys.isFollowing(userId),
      queryFn: async () => {
        const res = await api.users.me["check-follow"]({ id: userId }).get();
        const data = unwrapEdenResponse(res);
        return { isFollowing: data.isFollowing };
      },
      staleTime: 30 * SECOND,
    }),

  myFollowing: () =>
    edenQueryOptions({
      queryKey: userKeys.following(),
      queryFn: () => api.users.me.following.get(),
      staleTime: 1 * MINUTE,
    }),

  myProfile: () =>
    edenQueryOptions({
      queryKey: userKeys.meProfile(),
      queryFn: () => api.users.me.profile.get(),
      staleTime: 1 * MINUTE,
    }),

  myAdminStatus: () =>
    edenQueryOptions({
      queryKey: userKeys.meAdminStatus(),
      queryFn: () => api.users.me["admin-status"].get(),
      staleTime: 30 * SECOND,
    }),
};

export type UserWithProfile = Awaited<ReturnType<typeof getUserProfile>>;
export type PublicUserLibrary = Awaited<ReturnType<typeof getUserPublicLibrary>>;
