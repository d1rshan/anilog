import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";

import { getCurrentUser } from "@/features/auth/lib/server";
import {
  myLibraryQueryOptions,
  userByUsernameQueryOptions,
  userPublicLibraryQueryOptions,
} from "@/lib/query-options";
import { userKeys } from "@/lib/query-keys";

import { UnifiedProfile } from "../components/unified-profile";
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

  try {
    await queryClient.prefetchQuery(userByUsernameQueryOptions(username));
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const user = queryClient.getQueryData<UserWithProfile>(userKeys.byUsername(username));

  if (!user) {
    notFound();
  }

  const isOwnProfile = currentUser?.id === user.id;

  if (isOwnProfile) {
    await queryClient.prefetchQuery(myLibraryQueryOptions());
  } else {
    await queryClient.prefetchQuery(userPublicLibraryQueryOptions(user.id));
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnifiedProfile username={username} userId={user.id} isOwnProfile={isOwnProfile} />
    </HydrationBoundary>
  );
};

function isNotFoundError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  return (
    "status" in error &&
    typeof (error as { status?: unknown }).status === "number" &&
    (error as { status: number }).status === 404
  );
}
