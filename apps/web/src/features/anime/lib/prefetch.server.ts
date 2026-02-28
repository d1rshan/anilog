import "server-only";

import type { QueryClient } from "@tanstack/react-query";

import { animeQueries } from "@/features/anime/lib/options";
import { libraryQueries } from "@/features/library/lib/options";

export async function prefetchAnimeHome(
  queryClient: QueryClient,
  options?: { includeMyLibrary?: boolean },
) {
  await queryClient.prefetchQuery(animeQueries.trending());

  if (options?.includeMyLibrary) {
    await queryClient.prefetchQuery(libraryQueries.myLibrary());
  }
}
