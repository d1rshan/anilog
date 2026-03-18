import "server-only";

import type { QueryClient } from "@tanstack/react-query";

import { prefetchMyLibrary } from "@/features/library/server/prefetch";

import { userQueries } from "./options";

export async function prefetchUserByUsername(queryClient: QueryClient, username: string) {
  await queryClient.prefetchQuery(userQueries.byUsername({ params: { username } }));
}

export async function prefetchProfileLibrary(
  queryClient: QueryClient,
  options: { isOwnProfile: boolean; userId: string },
) {
  if (options.isOwnProfile) {
    await prefetchMyLibrary(queryClient);
    return;
  }

  await queryClient.prefetchQuery(userQueries.publicLibrary({ params: { id: options.userId } }));
}
