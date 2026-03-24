import "server-only";

import type { QueryClient } from "@tanstack/react-query";
import { libraryQueries } from "./library.api";

export async function prefetchMyLibrary(queryClient: QueryClient) {
  await queryClient.prefetchQuery(libraryQueries.myLibrary());
}
