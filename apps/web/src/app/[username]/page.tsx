import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getSession } from "@/features/auth/lib/server";
import { api } from "@/lib/api";
import { UnifiedProfile } from "@/features/users/routes/unified-profile";
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

  let user: UserWithProfile;
  try {
    const res = await api.users.username({ username }).get();
    if (res.error) {
      notFound();
    }
    user = res.data;

    // Prefetch lists
    await queryClient.prefetchQuery({
      queryKey: ["users", "lists", user.id],
      queryFn: async () => {
        const listsRes = await api.users({ id: user.id }).lists.get();
        if (listsRes.error) throw listsRes.error;
        return listsRes.data;
      },
    });
  } catch {
    notFound();
  }

  // Check if viewing own profile
  const isOwnProfile = session?.user?.id === user.id;

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UnifiedProfile user={user} isOwnProfile={isOwnProfile} />
    </HydrationBoundary>
  );
}
