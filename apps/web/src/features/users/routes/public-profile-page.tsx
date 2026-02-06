"use client";

import { useSession } from "@/features/auth/lib/hooks";
import { ProfileHeader } from "@/features/users/components/profile-header";
import { UserListsPublic } from "@/features/users/components/user-lists-public";
import { Loader2 } from "lucide-react";

interface PublicProfilePageProps {
  userId: string;
}

export function PublicProfilePage({ userId }: PublicProfilePageProps) {
  const { data: session } = useSession();
  const isOwnProfile = session?.user?.id === userId;

  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <ProfileHeader userId={userId} isOwnProfile={isOwnProfile} />
        
        <div className="mt-8">
          <UserListsPublic userId={userId} />
        </div>
      </div>
    </div>
  );
}
