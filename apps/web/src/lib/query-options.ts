import { queryOptions } from "@tanstack/react-query";

import { getTrendingAnime, searchAnime } from "@/features/anime/lib/requests";
import { getMyLibrary } from "@/features/lists/lib/requests";
import {
  checkIsFollowing,
  getMyFollowing,
  getMyProfile,
  getUserByUsername,
  getUserProfile,
  getUserPublicLibrary,
  searchUsers,
} from "@/features/users/lib/requests";
import { animeKeys, libraryKeys, userKeys } from "@/lib/query-keys";

const SECOND = 1000;
const MINUTE = 60 * SECOND;

export const trendingAnimeQueryOptions = () =>
  queryOptions({
    queryKey: animeKeys.trending(),
    queryFn: getTrendingAnime,
    staleTime: 5 * MINUTE,
  });

export const searchAnimeQueryOptions = (query: string) =>
  queryOptions({
    queryKey: animeKeys.search(query),
    queryFn: () => searchAnime(query),
    staleTime: 2 * MINUTE,
  });

export const myLibraryQueryOptions = () =>
  queryOptions({
    queryKey: libraryKeys.me(),
    queryFn: getMyLibrary,
    staleTime: 1 * MINUTE,
  });

export const userSearchQueryOptions = (query: string) =>
  queryOptions({
    queryKey: userKeys.search(query),
    queryFn: () => searchUsers(query),
    staleTime: 30 * SECOND,
  });

export const userProfileQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: userKeys.profile(userId),
    queryFn: () => getUserProfile(userId),
    staleTime: 1 * MINUTE,
  });

export const userByUsernameQueryOptions = (username: string) =>
  queryOptions({
    queryKey: userKeys.byUsername(username),
    queryFn: () => getUserByUsername(username),
    staleTime: 1 * MINUTE,
  });

export const userPublicLibraryQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: libraryKeys.publicByUserId(userId),
    queryFn: () => getUserPublicLibrary(userId),
    staleTime: 1 * MINUTE,
  });

export const isFollowingQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: userKeys.isFollowing(userId),
    queryFn: async () => {
      const isFollowing = await checkIsFollowing(userId);
      return { isFollowing };
    },
    staleTime: 30 * SECOND,
  });

export const myFollowingQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.following(),
    queryFn: getMyFollowing,
    staleTime: 1 * MINUTE,
  });

export const myProfileQueryOptions = () =>
  queryOptions({
    queryKey: userKeys.meProfile(),
    queryFn: getMyProfile,
    staleTime: 1 * MINUTE,
  });
