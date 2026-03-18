import "server-only";

import type { QueryClient } from "@tanstack/react-query";

import { animeQueries } from "@/features/anime/lib/options";
import { prefetchMyLibrary } from "@/features/library/server/prefetch";

export async function prefetchAnimeHome(
  queryClient: QueryClient,
  options?: { includeMyLibrary?: boolean },
) {
  await queryClient.prefetchQuery(animeQueries.trending());

  if (options?.includeMyLibrary) {
    await prefetchMyLibrary(queryClient);
  }
}
