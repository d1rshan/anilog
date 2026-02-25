import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  isFollowingQueryOptions,
  myFollowingQueryOptions,
  myAdminStatusQueryOptions,
  myProfileQueryOptions,
  userByUsernameQueryOptions,
  userProfileQueryOptions,
  userPublicLibraryQueryOptions,
  userSearchQueryOptions,
} from "@/lib/query-options";
import { userKeys } from "@/lib/query-keys";

import {
  followUser,
  unfollowUser,
  updateMyProfile,
  type UserWithProfile,
  type UpdateProfileData,
} from "./requests";

export const useSearchUsers = (query: string) => {
  return useQuery({
    ...userSearchQueryOptions(query),
    enabled: query.length >= 3,
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery({
    ...userProfileQueryOptions(userId),
    enabled: !!userId,
  });
};

export const useUserByUsername = (username: string) => {
  return useQuery({
    ...userByUsernameQueryOptions(username),
    enabled: !!username,
  });
};

export const useUserLists = (userId: string) => {
  return useQuery({
    ...userPublicLibraryQueryOptions(userId),
    enabled: !!userId,
  });
};

export const useIsFollowing = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...isFollowingQueryOptions(userId),
    enabled: !!userId && (options?.enabled ?? true),
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: followUser,
    onSuccess: (_, userId) => {
      queryClient.setQueryData(userKeys.isFollowing(userId), { isFollowing: true });
      queryClient.setQueryData<UserWithProfile>(userKeys.profile(userId), (current) =>
        current ? { ...current, followerCount: current.followerCount + 1 } : current,
      );

      queryClient.invalidateQueries({ queryKey: userKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.following() });
      toast.success("Successfully followed user!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: (_, userId) => {
      queryClient.setQueryData(userKeys.isFollowing(userId), { isFollowing: false });
      queryClient.setQueryData<UserWithProfile>(userKeys.profile(userId), (current) =>
        current ? { ...current, followerCount: Math.max(0, current.followerCount - 1) } : current,
      );

      queryClient.invalidateQueries({ queryKey: userKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.following() });
      toast.success("Successfully unfollowed user");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useMyFollowing = () => {
  return useQuery(myFollowingQueryOptions());
};

export const useMyProfile = () => {
  return useQuery(myProfileQueryOptions());
};

export const useMyAdminStatus = (options?: { enabled?: boolean }) => {
  return useQuery({
    ...myAdminStatusQueryOptions(),
    enabled: options?.enabled ?? true,
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.meProfile() });
      queryClient.invalidateQueries({ queryKey: userKeys.profileRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.searchRoot() });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
