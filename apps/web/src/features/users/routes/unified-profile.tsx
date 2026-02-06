"use client";

import { ProfileHeader } from "@/features/users/components/profile-header";
import { UserListsPublic } from "@/features/users/components/user-lists-public";
import { EditableLists } from "@/features/lists/components/editable-lists";
import type { UserWithProfile } from "@/features/users/lib/requests";

interface UnifiedProfileProps {
  user: UserWithProfile;
  isOwnProfile: boolean;
}

export function UnifiedProfile({ user, isOwnProfile }: UnifiedProfileProps) {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
        
        <div className="mt-8">
          {isOwnProfile ? (
            <EditableLists />
          ) : (
            <UserListsPublic userId={user.id} />
          )}
        </div>
      </div>
    </div>
  );
}
