import "server-only";

import type { QueryClient } from "@tanstack/react-query";
import { prefetchMyLibrary } from "@/features/library/library.server";
import { animeQueries } from "./anime.api";

export async function prefetchAnimeHome(
  queryClient: QueryClient,
  options?: { includeMyLibrary?: boolean },
) {
  await queryClient.prefetchQuery(animeQueries.trending());

  if (options?.includeMyLibrary) {
    await prefetchMyLibrary(queryClient);
  }
}
