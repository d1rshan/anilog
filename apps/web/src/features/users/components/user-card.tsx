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
    <div 
      className="group relative flex cursor-pointer items-center gap-4 rounded-md border border-border/50 bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-lg" 
      onClick={handleNavigate}
    >
      <Avatar className="h-16 w-16 border-2 border-background shadow-sm ring-1 ring-border">
        <AvatarImage src={user.image || undefined} alt={displayName} />
        <AvatarFallback className="bg-muted text-lg font-black uppercase tracking-tighter">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-black uppercase tracking-tighter group-hover:underline">
              {displayName}
            </h3>
            <p className="truncate text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              @{username} • {user.followerCount} Followers
            </p>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <FollowButton userId={user.id} size="sm" />
          </div>
        </div>
        
        {bio && (
          <p className="mt-2 line-clamp-1 text-xs font-medium text-muted-foreground">
            {bio}
          </p>
        )}
      </div>
    </div>
  );
}
