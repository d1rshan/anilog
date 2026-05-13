import { queryOptions } from "@tanstack/react-query";
import type {
  PublicLibraryEntryDto,
  UpdateUserProfileBody,
  UserParams,
  UserSearchQuery,
  UsernameParams,
} from "@anilog/contracts";
import { api } from "@/lib/api";
import { edenFetch } from "@/lib/eden-fetch";
import { libraryKeys } from "@/features/library/library.keys";
import { usersKeys } from "./users.keys";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

const usersClient = {
  search: (query: UserSearchQuery) => edenFetch(() => api.users.search.get({ query })),
  getProfile: (params: UserParams) => edenFetch(() => api.users(params).get()),
  getByUsername: (params: UsernameParams) => edenFetch(() => api.users.username(params).get()),
  getPublicLibrary: (params: UserParams) => edenFetch(() => api.users(params).library.get()),
  getIsFollowing: (params: UserParams) =>
    edenFetch(() => api.users.me["check-follow"](params).get()),
  getMyFollowing: () => edenFetch(() => api.users.me.following.get()),
  getMyProfile: () => edenFetch(() => api.users.me.profile.get()),
  getMyAdminStatus: () => edenFetch(() => api.users.me["admin-status"].get()),
  follow: (params: UserParams) => edenFetch(() => api.users(params).follow.post()),
  unfollow: (params: UserParams) => edenFetch(() => api.users(params).follow.delete()),
  updateMyProfile: (body: UpdateUserProfileBody) => edenFetch(() => api.users.me.profile.put(body)),
};

export const usersQueries = {
  search: ({ query }: { query: UserSearchQuery }) =>
    queryOptions({
      queryKey: usersKeys.search(query.q),
      queryFn: () => usersClient.search(query),
      staleTime: 30 * SECOND,
    }),

  profile: ({ params }: { params: UserParams }) =>
    queryOptions({
      queryKey: usersKeys.profile(params.id),
      queryFn: () => usersClient.getProfile(params),
      staleTime: 1 * MINUTE,
    }),

  byUsername: ({ params }: { params: UsernameParams }) =>
    queryOptions({
      queryKey: usersKeys.byUsername(params.username),
      queryFn: () => usersClient.getByUsername(params),
      staleTime: 1 * MINUTE,
    }),

  publicLibrary: ({ params }: { params: UserParams }) =>
    queryOptions({
      queryKey: libraryKeys.publicByUserId(params.id),
      queryFn: () => usersClient.getPublicLibrary(params),
      staleTime: 1 * MINUTE,
    }),

  isFollowing: ({ params }: { params: UserParams }) =>
    queryOptions({
      queryKey: usersKeys.isFollowing(params.id),
      queryFn: () => usersClient.getIsFollowing(params),
      staleTime: 30 * SECOND,
    }),

  myFollowing: () =>
    queryOptions({
      queryKey: usersKeys.following(),
      queryFn: usersClient.getMyFollowing,
      staleTime: 1 * MINUTE,
    }),

  myProfile: () =>
    queryOptions({
      queryKey: usersKeys.meProfile(),
      queryFn: usersClient.getMyProfile,
      staleTime: 1 * MINUTE,
    }),

  myAdminStatus: () =>
    queryOptions({
      queryKey: usersKeys.meAdminStatus(),
      queryFn: usersClient.getMyAdminStatus,
      staleTime: 30 * SECOND,
    }),
};

export const usersMutations = {
  follow: () => ({
    mutationFn: ({ params }: { params: UserParams }) => usersClient.follow(params),
  }),

  unfollow: () => ({
    mutationFn: ({ params }: { params: UserParams }) => usersClient.unfollow(params),
  }),

  updateMyProfile: () => ({
    mutationFn: ({ body }: { body: UpdateUserProfileBody }) => usersClient.updateMyProfile(body),
  }),
};

export type PublicUserLibrary = PublicLibraryEntryDto[];
