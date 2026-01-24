import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { authClient } from "@/lib/auth-client";
import { UserProfile } from "@/features/profile/components/user-profile";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getUserLists } from "../lib/requests";

export default async function ProfilePage() {
  const session = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
      throw: true,
    },
  });

  if (!session?.user) {
    redirect("/login");
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["user-lists"],
    queryFn: getUserLists,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserProfile />
    </HydrationBoundary>
  );
}
