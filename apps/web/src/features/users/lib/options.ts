import { api } from "@/lib/api";
import { edenFetch } from "@/lib/eden-fetch";
import type {
  PublicLibraryEntryDto,
  UpdateUserProfileBody,
  UserParams,
  UserSearchQuery,
  UserWithProfileDto,
  UsernameParams,
} from "@anilog/contracts";
import { createQueryOptions, createMutationOptions } from "@/lib/query-helpers";
import { libraryKeys, userKeys } from "@/lib/query-keys";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const userQueries = {
  search: ({ query }: { query: UserSearchQuery }) =>
    createQueryOptions(userKeys.search(query.q), () => api.users.search.get({ query }), {
      staleTime: 30 * SECOND,
    }),

  profile: ({ params }: { params: UserParams }) =>
    createQueryOptions(userKeys.profile(params.id), () => api.users(params).get(), {
      staleTime: 1 * MINUTE,
    }),

  byUsername: ({ params }: { params: UsernameParams }) =>
    createQueryOptions(
      userKeys.byUsername(params.username),
      () => api.users.username(params).get(),
      { staleTime: 1 * MINUTE },
    ),

  publicLibrary: ({ params }: { params: UserParams }) =>
    createQueryOptions(
      libraryKeys.publicByUserId(params.id),
      () => api.users(params).library.get(),
      { staleTime: 1 * MINUTE },
    ),

  isFollowing: ({ params }: { params: UserParams }) => ({
    queryKey: userKeys.isFollowing(params.id),
    queryFn: async () => {
      const data = await edenFetch(() => api.users.me["check-follow"](params).get());
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
      ({ params }: { params: UserParams }) => api.users(params).follow.post(),
      "user.follow",
    ),

  unfollow: () =>
    createMutationOptions(
      ({ params }: { params: UserParams }) => api.users(params).follow.delete(),
      "user.unfollow",
    ),

  updateMyProfile: () =>
    createMutationOptions(
      ({ body }: { body: UpdateUserProfileBody }) => api.users.me.profile.put(body),
      "user.profile.update",
    ),
};

export type UserWithProfile = UserWithProfileDto;
export type PublicUserLibrary = PublicLibraryEntryDto[];
export type { UpdateUserProfileBody as UpdateProfileData };
