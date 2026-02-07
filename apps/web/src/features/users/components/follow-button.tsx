"use client";

import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useIsFollowing, useFollowUser, useUnfollowUser } from "../lib/hooks";

interface FollowButtonProps {
  userId: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "secondary" | "outline" | "ghost";
}

export function FollowButton({
  userId,
  size = "sm",
  variant = "default",
}: FollowButtonProps) {
  const { data: followStatus, isLoading: isChecking } = useIsFollowing(userId);
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const isFollowing = followStatus?.isFollowing ?? false;
  const isLoading = isChecking || followMutation.isPending || unfollowMutation.isPending;

  const handleClick = () => {
    if (isFollowing) {
      unfollowMutation.mutate(userId);
    } else {
      followMutation.mutate(userId);
    }
  };

  return (
    <Button
      size={size}
      variant={isFollowing ? "outline" : variant}
      onClick={handleClick}
      disabled={isLoading}
      className="min-w-[100px]"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="h-4 w-4 mr-1.5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-1.5" />
          Follow
        </>
      )}
    </Button>
  );
}
