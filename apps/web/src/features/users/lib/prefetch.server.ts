import "server-only";

import type { QueryClient } from "@tanstack/react-query";

import { libraryQueries } from "@/features/lists/lib/queries";

import { userQueries } from "./queries";

export async function prefetchUserByUsername(queryClient: QueryClient, username: string) {
  await queryClient.prefetchQuery(userQueries.byUsername(username));
}

export async function prefetchProfileLibrary(
  queryClient: QueryClient,
  options: { isOwnProfile: boolean; userId: string },
) {
  if (options.isOwnProfile) {
    await queryClient.prefetchQuery(libraryQueries.myLibrary());
    return;
  }

  await queryClient.prefetchQuery(userQueries.publicLibrary(options.userId));
}
