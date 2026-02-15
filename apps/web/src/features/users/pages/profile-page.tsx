import { notFound } from "next/navigation";
import { headers } from "next/headers";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { getCurrentUser } from "@/features/auth/lib/server";
import { api } from "@/lib/api";

import { UnifiedProfile } from "../components/unified-profile";
import { getUserByUsername } from "../lib/requests";
import type { UserWithProfile } from "../lib/requests";

interface UserProfilePageProps {
  params: Promise<{
    username: string;
  }>;
}

export const UserProfilePage = async ({ params }: UserProfilePageProps) => {
  const { username } = await params;
  const headersList = await headers();
  const currentUser = await getCurrentUser(headersList);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["users", "username", username],
    queryFn: () => getUserByUsername(username),
  });

  const user = queryClient.getQueryData<UserWithProfile>([
    "users",
    "username",
    username,
  ]);

  if (!user) {
    notFound();
  }

  await queryClient.prefetchQuery({
    queryKey: ["users", "library", user.id],
    queryFn: async () => {
      const libraryRes = await api.users({ id: user.id }).library.get();
      if (libraryRes.error) throw libraryRes.error;
      return libraryRes.data;
    },
  });

  const isOwnProfile = currentUser?.id === user.id;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnifiedProfile
        username={username}
        userId={user.id}
        isOwnProfile={isOwnProfile}
      />
    </HydrationBoundary>
  );
};
