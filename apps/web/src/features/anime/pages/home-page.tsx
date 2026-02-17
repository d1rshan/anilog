import { headers } from "next/headers";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { getCurrentUser } from "@/features/auth/lib/server";
import {
  myLibraryQueryOptions,
  trendingAnimeQueryOptions,
} from "@/lib/query-options";
import { DiscoverSearchShell } from "../components/discover-search-shell";

export const HomePage = async () => {
  const headersList = await headers();
  const user = await getCurrentUser(headersList);

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery(trendingAnimeQueryOptions());

  if (user) {
    await queryClient.prefetchQuery(myLibraryQueryOptions());
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DiscoverSearchShell />
    </HydrationBoundary>
  );
};
