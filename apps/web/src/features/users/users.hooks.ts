import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UserWithProfileDto } from "@anilog/contracts";
import { toast } from "sonner";
import { usersMutations, usersQueries } from "./users.api";
import { usersKeys } from "./users.keys";
import { getApiErrorMessage } from "@/lib/eden-fetch";

export const useSearchUsers = (query: string) => {
  return useQuery({
    ...usersQueries.search({ query: { q: query } }),
    enabled: query.length >= 3,
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery({
    ...usersQueries.profile({ params: { id: userId } }),
    enabled: !!userId,
  });
};

export const useUserByUsername = (username: string) => {
  return useQuery({
    ...usersQueries.byUsername({ params: { username } }),
    enabled: !!username,
  });
};

export const useUserLists = (userId: string) => {
  return useQuery({
    ...usersQueries.publicLibrary({ params: { id: userId } }),
    enabled: !!userId,
  });
};

export const useIsFollowing = (userId: string, options?: { enabled?: boolean }) => {
  return useQuery({
    ...usersQueries.isFollowing({ params: { id: userId } }),
    enabled: !!userId && (options?.enabled ?? true),
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...usersMutations.follow(),
    onSuccess: (_, { params }) => {
      toast.success("Successfully followed user!");
      queryClient.setQueryData(usersKeys.isFollowing(params.id), { isFollowing: true });
      queryClient.setQueryData<UserWithProfileDto>(
        usersKeys.profile(params.id),
        (current: UserWithProfileDto | undefined) =>
          current ? { ...current, followerCount: current.followerCount + 1 } : current,
      );

      queryClient.invalidateQueries({ queryKey: usersKeys.searchRoot() });
      queryClient.invalidateQueries({ queryKey: usersKeys.profileRoot() });
      queryClient.invalidateQueries({ queryKey: usersKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: usersKeys.meProfile() });
      queryClient.invalidateQueries({ queryKey: usersKeys.following() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...usersMutations.unfollow(),
    onSuccess: (_, { params }) => {
      toast.success("Successfully unfollowed user");
      queryClient.setQueryData(usersKeys.isFollowing(params.id), { isFollowing: false });
      queryClient.setQueryData<UserWithProfileDto>(
        usersKeys.profile(params.id),
        (current: UserWithProfileDto | undefined) =>
          current ? { ...current, followerCount: Math.max(0, current.followerCount - 1) } : current,
      );

      queryClient.invalidateQueries({ queryKey: usersKeys.searchRoot() });
      queryClient.invalidateQueries({ queryKey: usersKeys.profileRoot() });
      queryClient.invalidateQueries({ queryKey: usersKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: usersKeys.meProfile() });
      queryClient.invalidateQueries({ queryKey: usersKeys.following() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useMyFollowing = () => {
  return useQuery(usersQueries.myFollowing());
};

export const useMyProfile = () => {
  return useQuery(usersQueries.myProfile());
};

export const useMyAdminStatus = (options?: { enabled?: boolean }) => {
  return useQuery({
    ...usersQueries.myAdminStatus(),
    enabled: options?.enabled ?? true,
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    ...usersMutations.updateMyProfile(),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: usersKeys.meProfile() });
      queryClient.invalidateQueries({ queryKey: usersKeys.profileRoot() });
      queryClient.invalidateQueries({ queryKey: usersKeys.byUsernameRoot() });
      queryClient.invalidateQueries({ queryKey: usersKeys.searchRoot() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};
