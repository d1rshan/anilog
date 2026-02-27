import "server-only";

import type { QueryClient } from "@tanstack/react-query";

import { animeQueries } from "@/features/anime/lib/queries";
import { libraryQueries } from "@/features/lists/lib/queries";

export async function prefetchAnimeHome(
  queryClient: QueryClient,
  options?: { includeMyLibrary?: boolean },
) {
  await queryClient.prefetchQuery(animeQueries.trending());

  if (options?.includeMyLibrary) {
    await queryClient.prefetchQuery(libraryQueries.myLibrary());
  }
}
