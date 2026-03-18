import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userQueries, type UserWithProfile } from "@/features/users/lib/options";
import { userMutations, type UpdateProfileData } from "@/features/users/lib/options";
import { getApiErrorMessage } from "@/lib/eden-fetch";
import { userKeys } from "@/lib/query-keys";

export const useSearchUsers = (query: string) => {
  return useQuery({
    ...userQueries.search({ query: { q: query } }),
    enabled: query.length >= 3,
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery({
    ...userQueries.profile({ params: { id: userId } }),
    enabled: !!userId,
  });
};

export const useUserByUsername = (username: string) => {
  return useQuery({
    ...userQueries.byUsername({ params: { username } }),
    enabled: !!username,
  });
};

export const useUserLists = (userId: string) => {
  return useQuery({
    ...userQueries.publicLibrary({ params: { id: userId } }),
    enabled: !!userId,
  });
};

export const useIsFollowing = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...userQueries.isFollowing({ params: { id: userId } }),
    enabled: !!userId && (options?.enabled ?? true),
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...userMutations.follow(),
    onSuccess: (_, { params }) => {
      toast.success("Successfully followed user!");
      queryClient.setQueryData(userKeys.isFollowing(params.id), { isFollowing: true });
      queryClient.setQueryData<UserWithProfile>(
        userKeys.profile(params.id),
        (current: UserWithProfile | undefined) =>
          current ? { ...current, followerCount: current.followerCount + 1 } : current,
      );

      queryClient.invalidateQueries({ queryKey: userKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.following() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...userMutations.unfollow(),
    onSuccess: (_, { params }) => {
      toast.success("Successfully unfollowed user");
      queryClient.setQueryData(userKeys.isFollowing(params.id), { isFollowing: false });
      queryClient.setQueryData<UserWithProfile>(
        userKeys.profile(params.id),
        (current: UserWithProfile | undefined) =>
          current ? { ...current, followerCount: Math.max(0, current.followerCount - 1) } : current,
      );

      queryClient.invalidateQueries({ queryKey: userKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.following() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
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
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: userKeys.meProfile() });
      queryClient.invalidateQueries({ queryKey: userKeys.profileRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: userKeys.searchRoot() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export type { UpdateProfileData };
