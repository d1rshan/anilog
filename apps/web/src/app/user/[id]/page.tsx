import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { PublicProfilePage } from "@/features/users/routes/public-profile-page";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getUserProfile, getUserPublicLists } from "@/features/users/lib/requests";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;

  const queryClient = new QueryClient();

  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["users", "profile", id],
        queryFn: () => getUserProfile(id),
      }),
      queryClient.prefetchQuery({
        queryKey: ["users", "lists", id],
        queryFn: () => getUserPublicLists(id),
      }),
    ]);
  } catch {
    notFound();
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PublicProfilePage userId={id} />
    </HydrationBoundary>
  );
}
