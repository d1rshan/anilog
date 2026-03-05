import "server-only";

import type { QueryClient } from "@tanstack/react-query";

import { libraryQueries } from "@/features/library/lib/options";

import { userQueries } from "./options";

export async function prefetchUserByUsername(queryClient: QueryClient, username: string) {
  await queryClient.prefetchQuery(userQueries.byUsername({ params: { username } }));
}

export async function prefetchProfileLibrary(
  queryClient: QueryClient,
  options: { isOwnProfile: boolean; userId: string },
) {
  if (options.isOwnProfile) {
    await queryClient.prefetchQuery(libraryQueries.myLibrary());
    return;
  }

  await queryClient.prefetchQuery(userQueries.publicLibrary({ params: { id: options.userId } }));
}
