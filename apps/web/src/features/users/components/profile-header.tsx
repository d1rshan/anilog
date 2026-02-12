"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FollowButton } from "./follow-button";
import { EditProfileDialog } from "./edit-profile-dialog";
import { Globe, MapPin, Settings } from "lucide-react";
import type { UserWithProfile } from "@/features/users/lib/requests";

interface ProfileHeaderProps {
  user: UserWithProfile;
  isOwnProfile: boolean;
}

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const displayName = user.profile?.displayName || user.name;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <>
      <div className="flex flex-col gap-8 py-12">
        {/* TOP SECTION: AVATAR & BASIC INFO */}
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-end md:gap-10">
          <Avatar className="h-32 w-32 border-4 border-background shadow-xl ring-1 ring-border md:h-40 md:w-40">
            <AvatarImage src={user.image || undefined} alt={displayName} />
            <AvatarFallback className="bg-muted text-4xl font-black uppercase tracking-tighter">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-1 flex-col items-center gap-4 md:items-start md:gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h1 className="font-display text-5xl font-extrabold uppercase tracking-tight md:text-7xl leading-[0.9]">
                {displayName}
              </h1>
              <div className="flex items-center justify-center gap-3 text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase md:justify-start">
                <span>@{user.username || user.name}</span>
                {user.profile?.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {user.profile.location}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {!isOwnProfile ? (
                <FollowButton userId={user.id} size="lg" />
              ) : (
                <Button variant="outline" size="sm" className="h-9 font-bold uppercase tracking-widest text-[10px]" onClick={() => setIsEditDialogOpen(true)}>
                  <Settings className="mr-2 h-3 w-3" />
                  EDIT PROFILE
                </Button>
              )}
              {user.profile?.website && (
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full" asChild>
                  <a href={user.profile.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: BIO & STATS */}
        <div className="grid grid-cols-1 gap-8 border-t border-white/10 pt-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              ABOUT
            </h2>
            {user.profile?.bio ? (
              <p className="max-w-xl text-lg font-medium leading-relaxed tracking-tight">
                {user.profile.bio}
              </p>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                No bio provided.
              </p>
            )}
          </div>

          <div className="flex flex-row justify-between gap-8 md:flex-col md:justify-start">
            <div className="space-y-1">
              <p className="font-display text-4xl font-bold tracking-tight md:text-6xl leading-[0.9]">
                {user.followerCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                FOLLOWERS
              </p>
            </div>
            <div className="space-y-1">
              <p className="font-display text-4xl font-bold tracking-tight md:text-6xl leading-[0.9]">
                {user.followingCount}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                FOLLOWING
              </p>
            </div>
          </div>
        </div>
      </div>

      <EditProfileDialog
        user={user}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
