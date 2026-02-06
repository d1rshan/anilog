import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/features/auth/lib/server";
import { api } from "@/lib/api";
import { UnifiedProfile } from "@/features/users/routes/unified-profile";
import { getUserByUsername } from "@/features/users/lib/requests";
import type { UserWithProfile } from "@/features/users/lib/requests";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  const headersList = await headers();
  const session = await getSession(headersList);

  const queryClient = new QueryClient();

  // Prefetch user profile data
  await queryClient.prefetchQuery({
    queryKey: ["users", "username", username],
    queryFn: () => getUserByUsername(username),
  });

  // Get the prefetched data to check if user exists
  const user = queryClient.getQueryData<UserWithProfile>(["users", "username", username]);

  if (!user) {
    notFound();
  }

  // Prefetch lists
  await queryClient.prefetchQuery({
    queryKey: ["users", "lists", user.id],
    queryFn: async () => {
      const listsRes = await api.users({ id: user.id }).lists.get();
      if (listsRes.error) throw listsRes.error;
      return listsRes.data;
    },
  });

  // Check if viewing own profile
  const isOwnProfile = session?.user?.id === user.id;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnifiedProfile username={username} userId={user.id} isOwnProfile={isOwnProfile} />
    </HydrationBoundary>
  );
}
