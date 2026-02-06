"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "./follow-button";
import type { UserWithProfile } from "../lib/requests";
import { useRouter } from "next/navigation";

interface UserCardProps {
  user: UserWithProfile;
}

export function UserCard({ user }: UserCardProps) {
  const router = useRouter();
  const displayName = user.profile?.displayName || user.name;
  const username = user.username || user.name;
  const bio = user.profile?.bio;
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleNavigate = () => {
    if (user.username) {
      router.push(`/${user.username}`);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleNavigate}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarImage src={user.image || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">
                  {displayName}
                </h3>
                <p className="text-sm text-muted-foreground truncate">
                  @{username}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user.followerCount} follower{user.followerCount !== 1 ? "s" : ""}
                </p>
              </div>
              <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                <FollowButton userId={user.id} size="sm" />
              </div>
            </div>

            {bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {bio}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
