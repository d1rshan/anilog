"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { FollowButton } from "./follow-button";
import type { UserWithProfile } from "../lib/requests";
import { useRouter } from "next/navigation";
import type { Route } from "next";

interface UserCardProps {
  user: UserWithProfile;
}

export function UserCard({ user }: UserCardProps) {
  const router = useRouter();
  const displayName = user.profile?.displayName || user.name;
  const bio = user.profile?.bio;
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleNavigate = () => {
    router.push(("/user/" + user.id) as Route);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div onClick={handleNavigate} className="cursor-pointer">
            <Avatar className="h-12 w-12 hover:opacity-80 transition-opacity">
              <AvatarImage src={user.image || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <button
                  onClick={handleNavigate}
                  className="font-semibold hover:underline truncate block text-left"
                >
                  {displayName}
                </button>
                <p className="text-xs text-muted-foreground">
                  {user.followerCount} follower{user.followerCount !== 1 ? "s" : ""}
                </p>
              </div>
              <FollowButton userId={user.id} size="sm" />
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
