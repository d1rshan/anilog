import { queryOptions } from "@tanstack/react-query";
import type { LibraryEntryDto, LibraryStatusSchema } from "@anilog/contracts";
import { libraryClient } from "./library.client";
import { libraryKeys } from "./library.keys";

const MINUTE = 60_000;

export type LibraryStatus = LibraryStatusSchema;
export type LibraryEntryWithAnime = LibraryEntryDto;

export const LIBRARY_STATUSES: LibraryStatus[] = ["watching", "completed", "watchlist", "dropped"];

export const libraryQueries = {
  myLibrary: () =>
    queryOptions({
      queryKey: libraryKeys.me(),
      queryFn: libraryClient.getMine,
      staleTime: 1 * MINUTE,
    }),
};
