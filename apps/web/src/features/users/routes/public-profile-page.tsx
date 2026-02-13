"use client";

import { useSession } from "@/features/auth/lib/hooks";
import { useUserProfile } from "@/features/users/lib/hooks";
import { ProfileHeader } from "@/features/users/components/profile-header";
import { UserListsPublic } from "@/features/users/components/user-lists-public";
import { Loader2 } from "lucide-react";

interface PublicProfilePageProps {
  userId: string;
}

export function PublicProfilePage({ userId }: PublicProfilePageProps) {
  const { data: session } = useSession();
  const { data: user, isLoading } = useUserProfile(userId);
  const isOwnProfile = session?.user?.id === userId;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-24">
        <ProfileHeader user={user} isOwnProfile={isOwnProfile} />
        
        <div className="mt-20">
          <UserListsPublic userId={userId} />
        </div>
      </div>
    </div>
  );
}
