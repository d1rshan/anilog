import { api } from "@/lib/api";
import { edenQueryOptions } from "@/lib/eden-query";
import { unwrapEdenResponse } from "@/lib/eden";
import { libraryKeys } from "@/lib/query-keys";

const MINUTE = 60_000;

export const LIBRARY_STATUSES = ["watching", "completed", "planned", "dropped"] as const;

export async function getMyLibrary() {
  const res = await api.library.me.get();
  return unwrapEdenResponse(res);
}

export const libraryQueries = {
  myLibrary: () =>
    edenQueryOptions({
      queryKey: libraryKeys.me(),
      queryFn: () => api.library.me.get(),
      staleTime: 1 * MINUTE,
    }),
};

export type LibraryEntryWithAnime = Awaited<ReturnType<typeof getMyLibrary>>[number];
