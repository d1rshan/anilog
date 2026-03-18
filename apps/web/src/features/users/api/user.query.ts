import { queryOptions } from "@tanstack/react-query";
import type {
  PublicLibraryEntryDto,
  UpdateUserProfileBody,
  UserParams,
  UserSearchQuery,
  UserWithProfileDto,
  UsernameParams,
} from "@anilog/contracts";
import { libraryKeys } from "@/features/library/api/library.keys";
import { userClient } from "./user.client";
import { userKeys } from "./user.keys";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const userQueries = {
  search: ({ query }: { query: UserSearchQuery }) =>
    queryOptions({
      queryKey: userKeys.search(query.q),
      queryFn: () => userClient.search(query),
      staleTime: 30 * SECOND,
    }),

  profile: ({ params }: { params: UserParams }) =>
    queryOptions({
      queryKey: userKeys.profile(params.id),
      queryFn: () => userClient.getProfile(params),
      staleTime: 1 * MINUTE,
    }),

  byUsername: ({ params }: { params: UsernameParams }) =>
    queryOptions({
      queryKey: userKeys.byUsername(params.username),
      queryFn: () => userClient.getByUsername(params),
      staleTime: 1 * MINUTE,
    }),

  publicLibrary: ({ params }: { params: UserParams }) =>
    queryOptions({
      queryKey: libraryKeys.publicByUserId(params.id),
      queryFn: () => userClient.getPublicLibrary(params),
      staleTime: 1 * MINUTE,
    }),

  isFollowing: ({ params }: { params: UserParams }) =>
    queryOptions({
      queryKey: userKeys.isFollowing(params.id),
      queryFn: () => userClient.getIsFollowing(params),
      staleTime: 30 * SECOND,
    }),

  myFollowing: () =>
    queryOptions({
      queryKey: userKeys.following(),
      queryFn: userClient.getMyFollowing,
      staleTime: 1 * MINUTE,
    }),

  myProfile: () =>
    queryOptions({
      queryKey: userKeys.meProfile(),
      queryFn: userClient.getMyProfile,
      staleTime: 1 * MINUTE,
    }),

  myAdminStatus: () =>
    queryOptions({
      queryKey: userKeys.meAdminStatus(),
      queryFn: userClient.getMyAdminStatus,
      staleTime: 30 * SECOND,
    }),
};

export type UserWithProfile = UserWithProfileDto;
export type PublicUserLibrary = PublicLibraryEntryDto[];
export type { UpdateUserProfileBody as UpdateProfileData };
