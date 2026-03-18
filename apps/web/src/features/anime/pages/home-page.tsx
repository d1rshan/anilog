import { headers } from "next/headers";
import { HydrationBoundary, QueryClient, dehydrate } from "@tanstack/react-query";

import { getCurrentUser } from "@/features/auth/lib/server";
import { prefetchAnimeHome } from "@/features/anime/server/prefetch";

import { DiscoverSearchShell } from "../components/discover-search-shell";

export const HomePage = async () => {
  const headersList = await headers();
  const user = await getCurrentUser(headersList);

  const queryClient = new QueryClient();

  await prefetchAnimeHome(queryClient, { includeMyLibrary: Boolean(user) });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DiscoverSearchShell />
    </HydrationBoundary>
  );
};
