import "server-only";

import type { QueryClient } from "@tanstack/react-query";
import { prefetchMyLibrary } from "@/features/library/library.server";
import { usersQueries } from "./users.api";

export async function prefetchUserByUsername(queryClient: QueryClient, username: string) {
  await queryClient.prefetchQuery(usersQueries.byUsername({ params: { username } }));
}

export async function prefetchProfileLibrary(
  queryClient: QueryClient,
  options: { isOwnProfile: boolean; userId: string },
) {
  if (options.isOwnProfile) {
    await prefetchMyLibrary(queryClient);
    return;
  }

  await queryClient.prefetchQuery(usersQueries.publicLibrary({ params: { id: options.userId } }));
}
