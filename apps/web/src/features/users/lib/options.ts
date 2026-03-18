import { api } from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";
import { edenFetch } from "@/lib/eden-fetch";
import type {
  PublicLibraryEntryDto,
  UpdateUserProfileBody,
  UserParams,
  UserSearchQuery,
  UserWithProfileDto,
  UsernameParams,
} from "@anilog/contracts";
import { libraryKeys, userKeys } from "@/lib/query-keys";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const userQueries = {
  search: ({ query }: { query: UserSearchQuery }) =>
    queryOptions({
      queryKey: userKeys.search(query.q),
      queryFn: () => edenFetch(() => api.users.search.get({ query })),
      staleTime: 30 * SECOND,
    }),

  profile: ({ params }: { params: UserParams }) =>
    queryOptions({
      queryKey: userKeys.profile(params.id),
      queryFn: () => edenFetch(() => api.users(params).get()),
      staleTime: 1 * MINUTE,
    }),

  byUsername: ({ params }: { params: UsernameParams }) =>
    queryOptions({
      queryKey: userKeys.byUsername(params.username),
      queryFn: () => edenFetch(() => api.users.username(params).get()),
      staleTime: 1 * MINUTE,
    }),

  publicLibrary: ({ params }: { params: UserParams }) =>
    queryOptions({
      queryKey: libraryKeys.publicByUserId(params.id),
      queryFn: () => edenFetch(() => api.users(params).library.get()),
      staleTime: 1 * MINUTE,
    }),

  isFollowing: ({ params }: { params: UserParams }) => ({
    queryKey: userKeys.isFollowing(params.id),
    queryFn: async () => {
      const data = await edenFetch(() => api.users.me["check-follow"](params).get());
      return { isFollowing: data.isFollowing };
    },
    staleTime: 30 * SECOND,
  }),

  myFollowing: () =>
    queryOptions({
      queryKey: userKeys.following(),
      queryFn: () => edenFetch(() => api.users.me.following.get()),
      staleTime: 1 * MINUTE,
    }),

  myProfile: () =>
    queryOptions({
      queryKey: userKeys.meProfile(),
      queryFn: () => edenFetch(() => api.users.me.profile.get()),
      staleTime: 1 * MINUTE,
    }),

  myAdminStatus: () =>
    queryOptions({
      queryKey: userKeys.meAdminStatus(),
      queryFn: () => edenFetch(() => api.users.me["admin-status"].get()),
      staleTime: 30 * SECOND,
    }),
};

export const userMutations = {
  follow: () => ({
    mutationFn: ({ params }: { params: UserParams }) =>
      edenFetch(() => api.users(params).follow.post()),
  }),

  unfollow: () => ({
    mutationFn: ({ params }: { params: UserParams }) =>
      edenFetch(() => api.users(params).follow.delete()),
  }),

  updateMyProfile: () => ({
    mutationFn: ({ body }: { body: UpdateUserProfileBody }) =>
      edenFetch(() => api.users.me.profile.put(body)),
  }),
};

export type UserWithProfile = UserWithProfileDto;
export type PublicUserLibrary = PublicLibraryEntryDto[];
export type { UpdateUserProfileBody as UpdateProfileData };
