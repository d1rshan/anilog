import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  searchUsers,
  getUserProfile,
  getUserPublicLists,
  followUser,
  unfollowUser,
  checkIsFollowing,
  getMyFollowing,
  getMyProfile,
  updateMyProfile,
  type UserWithProfile,
  type UpdateProfileData,
} from "./requests";

export const useSearchUsers = (query: string) => {
  return useQuery<UserWithProfile[]>({
    queryKey: ["users", "search", query],
    queryFn: () => searchUsers(query),
    enabled: query.length >= 3,
  });
};

export const useUserProfile = (userId: string) => {
  return useQuery<UserWithProfile>({
    queryKey: ["users", "profile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
  });
};

export const useUserLists = (userId: string) => {
  return useQuery({
    queryKey: ["users", "lists", userId],
    queryFn: () => getUserPublicLists(userId),
    enabled: !!userId,
  });
};

export const useIsFollowing = (userId: string) => {
  return useQuery<{ isFollowing: boolean }>({
    queryKey: ["users", "is-following", userId],
    queryFn: async () => {
      const isFollowing = await checkIsFollowing(userId);
      return { isFollowing };
    },
    enabled: !!userId,
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: followUser,
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: ["users", "is-following", userId] });
      queryClient.invalidateQueries({ queryKey: ["users", "profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["users", "following"] });
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
      queryClient.invalidateQueries({ queryKey: ["users", "is-following", userId] });
      queryClient.invalidateQueries({ queryKey: ["users", "profile", userId] });
      queryClient.invalidateQueries({ queryKey: ["users", "following"] });
      toast.success("Successfully unfollowed user");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useMyFollowing = () => {
  return useQuery<UserWithProfile[]>({
    queryKey: ["users", "following"],
    queryFn: getMyFollowing,
  });
};

export const useMyProfile = () => {
  return useQuery<UserWithProfile>({
    queryKey: ["users", "me", "profile"],
    queryFn: getMyProfile,
  });
};

export const useUpdateMyProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileData) => updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users", "me", "profile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
