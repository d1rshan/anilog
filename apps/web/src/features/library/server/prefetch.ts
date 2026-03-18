import "server-only";

import type { QueryClient } from "@tanstack/react-query";
import { libraryQueries } from "../api/library.query";

export async function prefetchMyLibrary(queryClient: QueryClient) {
  await queryClient.prefetchQuery(libraryQueries.myLibrary());
}
