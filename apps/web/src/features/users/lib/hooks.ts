import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { ApiClientError } from "@/lib/eden";
import { getApiErrorMessage } from "@/lib/eden";

import { userQueries, type UserWithProfile } from "@/features/users/lib/queries";
import { userMutations, type UpdateProfileData } from "@/features/users/lib/mutations";
import { userKeys } from "@/lib/query-keys";

export const useSearchUsers = (query: string) => {
  return useQuery({
    ...userQueries.search(query),
    enabled: query.length >= 3,
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery({
    ...userQueries.profile(userId),
    enabled: !!userId,
  });
};

export const useUserByUsername = (username: string) => {
  return useQuery({
    ...userQueries.byUsername(username),
    enabled: !!username,
  });
};

export const useUserLists = (userId: string) => {
  return useQuery({
    ...userQueries.publicLibrary(userId),
    enabled: !!userId,
  });
};

export const useIsFollowing = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...userQueries.isFollowing(userId),
    enabled: !!userId && (options?.enabled ?? true),
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...userMutations.follow(),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(userKeys.isFollowing(userId), { isFollowing: true });
      queryClient.setQueryData<UserWithProfile>(userKeys.profile(userId), (current) =>
        current ? { ...current, followerCount: current.followerCount + 1 } : current,
      );

      queryClient.invalidateQueries({ queryKey: userKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.following() });
      toast.success("Successfully followed user!");
    },
    onError: (error: ApiClientError) => {
      toast.error(getApiErrorMessage(error, "Failed to follow user"));
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...userMutations.unfollow(),
    onSuccess: (_, userId) => {
      queryClient.setQueryData(userKeys.isFollowing(userId), { isFollowing: false });
      queryClient.setQueryData<UserWithProfile>(userKeys.profile(userId), (current) =>
        current ? { ...current, followerCount: Math.max(0, current.followerCount - 1) } : current,
      );

      queryClient.invalidateQueries({ queryKey: userKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.following() });
      toast.success("Successfully unfollowed user");
    },
    onError: (error: ApiClientError) => {
      toast.error(getApiErrorMessage(error, "Failed to unfollow user"));
    },
  });
};

export const useMyFollowing = () => {
  return useQuery(userQueries.myFollowing());
};

export const useMyProfile = () => {
  return useQuery(userQueries.myProfile());
};

export const useMyAdminStatus = (options?: { enabled?: boolean }) => {
  return useQuery({
    ...userQueries.myAdminStatus(),
    enabled: options?.enabled ?? true,
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    ...userMutations.updateMyProfile(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.meProfile() });
      queryClient.invalidateQueries({ queryKey: userKeys.profileRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.searchRoot() });
      toast.success("Profile updated successfully!");
    },
    onError: (error: ApiClientError) => {
      toast.error(getApiErrorMessage(error, "Failed to update profile"));
    },
  });
};

export type { UpdateProfileData };
