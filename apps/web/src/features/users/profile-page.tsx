import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";
import type { UserWithProfileDto } from "@anilog/contracts";
import { getCurrentUser } from "@/features/auth/auth.server";
import { usersKeys } from "./users.keys";
import { prefetchProfileLibrary, prefetchUserByUsername } from "./users.server";
import { UnifiedProfile } from "./components/unified-profile";

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
    await prefetchUserByUsername(queryClient, username);
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }

  const user = queryClient.getQueryData<UserWithProfileDto>(usersKeys.byUsername(username));

  if (!user) {
    notFound();
  }

  const isOwnProfile = currentUser?.id === user.id;

  await prefetchProfileLibrary(queryClient, {
    isOwnProfile,
    userId: user.id,
  });

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
