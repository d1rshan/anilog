import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PublicUserLibrary } from "@/features/users/users.api";
import type { LibraryEntryWithAnime } from "./library.api";
import { libraryKeys } from "./library.keys";
import type { MutationContext } from "./library.utils";

export const myLibraryQueryKey = libraryKeys.me();

function mapToPublicLibraryEntry(entry: LibraryEntryWithAnime): PublicUserLibrary[number] {
  return {
    id: entry.id,
    animeId: entry.animeId,
    status: entry.status,
    createdAt: entry.createdAt,
    currentEpisode: entry.currentEpisode,
    rating: entry.rating,
    anime: {
      id: entry.anime.id,
      title: entry.anime.title,
      titleJapanese: entry.anime.titleJapanese,
      imageUrl: entry.anime.imageUrl,
      year: entry.anime.year,
      episodes: entry.anime.episodes,
      status: entry.anime.status,
      genres: entry.anime.genres,
      rating: entry.anime.rating,
    },
  };
}

export function getLibraryMutationContext(previous?: LibraryEntryWithAnime[]): MutationContext {
  return {
    previous,
    currentUserId: previous?.[0]?.userId,
  };
}

export function rollbackLibraryCache(
  queryClient: QueryClient,
  context: MutationContext | undefined,
) {
  if (context?.previous) {
    queryClient.setQueryData(myLibraryQueryKey, context.previous);
  }
}

export function upsertLibraryEntryInCache(queryClient: QueryClient, entry: LibraryEntryWithAnime) {
  queryClient.setQueryData<LibraryEntryWithAnime[]>(myLibraryQueryKey, (current = []) => {
    const index = current.findIndex((item) => item.animeId === entry.animeId);

    if (index === -1) {
      return [...current, entry];
    }

    const next = [...current];
    next[index] = entry;
    return next;
  });
}

export function upsertPublicLibraryEntryInCache(
  queryClient: QueryClient,
  entry: LibraryEntryWithAnime,
) {
  if (!entry.userId) {
    return;
  }

  queryClient.setQueryData<PublicUserLibrary>(
    libraryKeys.publicByUserId(entry.userId),
    (current) => {
      if (!current) {
        return current;
      }

      const nextEntry = mapToPublicLibraryEntry(entry);
      const index = current.findIndex((item) => item.animeId === entry.animeId);
      if (index === -1) {
        return [...current, nextEntry];
      }

      const next = [...current];
      next[index] = nextEntry;
      return next;
    },
  );
}

export function removeLibraryEntryFromCache(queryClient: QueryClient, animeId: number) {
  queryClient.setQueryData<LibraryEntryWithAnime[]>(myLibraryQueryKey, (current = []) =>
    current.filter((entry) => entry.animeId !== animeId),
  );
}

export function getMyLibraryEntries(queryClient: QueryClient) {
  return queryClient.getQueryData<LibraryEntryWithAnime[]>(myLibraryQueryKey);
}

export async function applyOptimisticMyLibraryUpdate(
  queryClient: QueryClient,
  update: (previous: LibraryEntryWithAnime[]) => void,
) {
  await queryClient.cancelQueries({ queryKey: myLibraryQueryKey });

  const previous = getMyLibraryEntries(queryClient);
  if (previous) {
    update(previous);
  }

  return getLibraryMutationContext(previous);
}

export function removePublicLibraryEntryFromCache(
  queryClient: QueryClient,
  userId: string,
  animeId: number,
) {
  queryClient.setQueryData<PublicUserLibrary>(libraryKeys.publicByUserId(userId), (current) => {
    if (!current) {
      return current;
    }

    return current.filter((entry) => entry.animeId !== animeId);
  });
}

export function syncLibraryEntryCaches(queryClient: QueryClient, entry: LibraryEntryWithAnime) {
  upsertLibraryEntryInCache(queryClient, entry);
  upsertPublicLibraryEntryInCache(queryClient, entry);
}

export function invalidateLibraryCaches(queryClient: QueryClient, currentUserId?: string) {
  queryClient.invalidateQueries({ queryKey: myLibraryQueryKey });

  if (currentUserId) {
    queryClient.invalidateQueries({
      queryKey: libraryKeys.publicByUserId(currentUserId),
    });
  }
}

export function handleLibraryMutationSuccess(
  queryClient: QueryClient,
  data: LibraryEntryWithAnime,
  options?: {
    message?: string;
    currentUserId?: string;
    invalidatePublicLibrary?: boolean;
  },
) {
  if (options?.message) {
    toast.success(options.message);
  }

  syncLibraryEntryCaches(queryClient, data);
  invalidateLibraryCaches(
    queryClient,
    options?.invalidatePublicLibrary ? (options.currentUserId ?? data.userId) : undefined,
  );
}

export function handleLibraryMutationError(
  queryClient: QueryClient,
  context: MutationContext | undefined,
  message: string,
) {
  toast.error(message);
  rollbackLibraryCache(queryClient, context);
}
