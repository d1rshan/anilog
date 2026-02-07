"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FollowButton } from "./follow-button";
import { EditProfileDialog } from "./edit-profile-dialog";
import { Calendar, Globe, MapPin, User, Twitter, Github, Instagram, MessageCircle } from "lucide-react";
import type { UserWithProfile } from "@/features/users/lib/requests";

interface ProfileHeaderProps {
  user: UserWithProfile;
  isOwnProfile: boolean;
}

const socialLinks = [
  { key: "twitterUrl", icon: Twitter, label: "Twitter", color: "bg-sky-500/10 text-sky-500 hover:bg-sky-500/20" },
  { key: "discordUrl", icon: MessageCircle, label: "Discord", color: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20" },
  { key: "githubUrl", icon: Github, label: "GitHub", color: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20" },
  { key: "instagramUrl", icon: Instagram, label: "Instagram", color: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20" },
] as const;

export function ProfileHeader({ user, isOwnProfile }: ProfileHeaderProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const displayName = user.profile?.displayName || user.name;
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = new Date(user.profile?.createdAt || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Check if any social links exist
  const hasSocialLinks = socialLinks.some(
    (link) => user.profile?.[link.key as keyof typeof user.profile]
  );

  return (
    <>
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
          <p className="text-muted-foreground mb-4">@{user.username || user.name}</p>

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

          {/* Social Links */}
          {hasSocialLinks && (
            <div className="flex items-center gap-3 mb-4">
              {socialLinks.map((link) => {
                const url = user.profile?.[link.key as keyof typeof user.profile] as string | undefined;
                if (!url) return null;

                const Icon = link.icon;
                return (
                  <a
                    key={link.key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`
                      w-9 h-9 rounded-full flex items-center justify-center transition-all
                      ${link.color}
                    `}
                    aria-label={link.label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          )}

          {/* Member Since */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Calendar className="w-4 h-4" />
            <span>Member since {memberSince}</span>
          </div>

          {/* Follow Button */}
          {!isOwnProfile ? (
            <FollowButton userId={user.id} size="default" />
          ) : (
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
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

      <EditProfileDialog
        user={user}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
