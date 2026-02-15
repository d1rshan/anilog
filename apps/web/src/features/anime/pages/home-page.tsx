import { headers } from "next/headers";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { requireCurrentUser } from "@/features/auth/lib/server";
import {
  myLibraryQueryOptions,
  trendingAnimeQueryOptions,
} from "@/lib/query-options";
import { DiscoverSearchShell } from "../components/discover-search-shell";

export const HomePage = async () => {
  await requireCurrentUser(await headers());

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery(trendingAnimeQueryOptions()),
    queryClient.prefetchQuery(myLibraryQueryOptions()),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <DiscoverSearchShell />
    </HydrationBoundary>
  );
};
