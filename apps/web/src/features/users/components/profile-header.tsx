"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FollowButton } from "./follow-button";
import { useUserProfile } from "../lib/hooks";
import { Calendar, Globe, MapPin, Loader2, User } from "lucide-react";
import Link from "next/link";

interface ProfileHeaderProps {
  userId: string;
  isOwnProfile: boolean;
}

export function ProfileHeader({ userId, isOwnProfile }: ProfileHeaderProps) {
  const { data: user, isLoading, error } = useUserProfile(userId);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-full bg-muted animate-pulse mb-4" />
          <div className="h-8 bg-muted rounded w-48 animate-pulse mb-2" />
          <div className="h-4 bg-muted rounded w-32 animate-pulse" />
        </div>
      </Card>
    );
  }

  if (error || !user) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          404: User not found. Maybe they&apos;re in another dimension? 🌀
        </p>
      </Card>
    );
  }

  const displayName = user.profile?.displayName || user.name;
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = new Date(user.profile?.createdAt || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <Card className="p-8">
      <div className="flex flex-col items-center text-center">
        {/* Avatar */}
        <Avatar className="w-24 h-24 mb-4 ring-4 ring-primary/10">
          <AvatarImage src={user.image || undefined} alt={displayName} />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Name & Username */}
        <h1 className="text-2xl font-bold mb-1">{displayName}</h1>
        <p className="text-muted-foreground mb-4">@{user.name}</p>

        {/* Bio */}
        {user.profile?.bio ? (
          <p className="text-muted-foreground mb-4 max-w-md">{user.profile.bio}</p>
        ) : (
          <p className="text-muted-foreground italic mb-4 max-w-md">
            This user is mysterious... 🕵️ Their bio is as empty as my watchlist on a Monday morning.
          </p>
        )}

        {/* Website & Location */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground mb-4">
          {user.profile?.website && (
            <a
              href={user.profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Globe className="w-4 h-4" />
              {user.profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {user.profile?.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {user.profile.location}
            </span>
          )}
        </div>

        {/* Member Since */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Calendar className="w-4 h-4" />
          <span>Member since {memberSince}</span>
        </div>

        {/* Follow Button */}
        {!isOwnProfile ? (
          <FollowButton userId={userId} size="default" />
        ) : (
          <Link href="/profile">
            <Button variant="outline">
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        )}

        {/* Stats */}
        <div className="flex items-center gap-8 mt-6 pt-6 border-t w-full justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold">{user.followerCount}</p>
            <p className="text-sm text-muted-foreground">Followers</p>
          </div>
          <div className="w-px h-12 bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold">{user.followingCount}</p>
            <p className="text-sm text-muted-foreground">Following</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
