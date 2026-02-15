"use client";

import { ProfileHeader } from "@/features/users/components/profile-header";
import { UserListsPublic } from "@/features/users/components/user-lists-public";
import { EditableLists } from "@/features/lists/components/editable-lists";
import { useUserByUsername } from "@/features/users/lib/hooks";
import { Loader2 } from "lucide-react";

interface UnifiedProfileProps {
  username: string;
  userId: string;
  isOwnProfile: boolean;
}

export function UnifiedProfile({ username, userId, isOwnProfile }: UnifiedProfileProps) {
  const { data: user, isLoading, error } = useUserByUsername(username);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 pb-16 pt-20 md:py-24">
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
        
        <div className="mt-12 md:mt-20">
          {isOwnProfile ? (
            <EditableLists />
          ) : (
            <UserListsPublic userId={userId} />
          )}
        </div>
      </div>
    </div>
  );
}
