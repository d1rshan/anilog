import { redirect } from "next/navigation";
import { headers } from "next/headers";

import { getSession } from "@/features/auth/lib/server";
import { UserProfile } from "@/features/profile/components/user-profile";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getUserLists } from "../lib/requests";

export default async function ProfilePage() {
  const session = await getSession(await headers());

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
