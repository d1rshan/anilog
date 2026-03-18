import "server-only";

import type { QueryClient } from "@tanstack/react-query";
import { prefetchMyLibrary } from "@/features/library/server/prefetch";
import { animeQueries } from "../api/anime.query";

export async function prefetchAnimeHome(
  queryClient: QueryClient,
  options?: { includeMyLibrary?: boolean },
) {
  await queryClient.prefetchQuery(animeQueries.trending());

  if (options?.includeMyLibrary) {
    await prefetchMyLibrary(queryClient);
  }
}
