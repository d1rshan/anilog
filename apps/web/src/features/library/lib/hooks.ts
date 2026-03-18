import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { libraryQueries, type LibraryEntryWithAnime } from "./options";
import {
  libraryMutations,
  type LibraryStatus,
  type LogAnimeData,
  type UpdateLibraryProgressData,
  type UpdateLibraryRatingData,
  type UpdateLibraryStatusData,
} from "./options";
import type { PublicUserLibrary } from "@/features/users/lib/options";
import { getApiErrorMessage } from "@/lib/eden-fetch";
import { libraryKeys } from "@/lib/query-keys";

type MutationContext = {
  previous?: LibraryEntryWithAnime[];
  currentUserId?: string;
};

function upsertLibraryEntryInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  entry: LibraryEntryWithAnime,
) {
  queryClient.setQueryData<LibraryEntryWithAnime[]>(libraryKeys.me(), (current = []) => {
    const index = current.findIndex((item) => item.animeId === entry.animeId);

    if (index === -1) {
      return [...current, entry];
    }

    const next = [...current];
    next[index] = entry;
    return next;
  });
}

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

function upsertPublicLibraryEntryInCache(
  queryClient: ReturnType<typeof useQueryClient>,
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

function removePublicLibraryEntryFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
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

export const useMyLibrary = (options?: { enabled?: boolean }) => {
  return useQuery({
    ...libraryQueries.myLibrary(),
    enabled: options?.enabled ?? true,
  });
};

// Backward-compatible alias to keep imports stable while refactoring.
export const useUserLists = useMyLibrary;

export const useLogAnime = () => {
  const queryClient = useQueryClient();
  const mutation = libraryMutations.logAnime();

  return useMutation({
    ...mutation,
    onMutate: async ({ body }) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.me() });
      const previous = queryClient.getQueryData<LibraryEntryWithAnime[]>(libraryKeys.me());

      if (previous) {
        const optimistic: LibraryEntryWithAnime = {
          id: `optimistic-${body.anime.id}`,
          userId: "",
          animeId: body.anime.id,
          status: body.status,
          currentEpisode: Math.max(0, body.currentEpisode ?? 0),
          rating: body.rating ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          anime: {
            id: body.anime.id,
            title: body.anime.title,
            titleJapanese: body.anime.titleJapanese,
            imageUrl: body.anime.imageUrl,
            year: body.anime.year,
            episodes: body.anime.episodes,
            status: body.anime.status,
            genres: body.anime.genres,
            rating: body.anime.rating,
          },
        };

        upsertLibraryEntryInCache(queryClient, optimistic);
      }

      return {
        previous,
        currentUserId: previous?.[0]?.userId,
      };
    },
    onError: (_error, _payload, context: MutationContext | undefined) => {
      toast.error("Failed to log anime");
      if (context?.previous) {
        queryClient.setQueryData(libraryKeys.me(), context.previous);
      }
    },
    onSuccess: (data, payload, _context: MutationContext | undefined) => {
      toast.success(
        payload.body.status === "watchlist"
          ? `Added ${data.anime.title} to watchlist.`
          : `Saved changes for ${data.anime.title}.`,
      );
      upsertLibraryEntryInCache(queryClient, data);
      upsertPublicLibraryEntryInCache(queryClient, data);
    },
    onSettled: (_data, _error, _payload, context) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.me() });

      if (context?.currentUserId) {
        queryClient.invalidateQueries({
          queryKey: libraryKeys.publicByUserId(context.currentUserId),
        });
      }
    },
  });
};

export const useUpdateLibraryStatus = () => {
  const queryClient = useQueryClient();
  const mutation = libraryMutations.updateLibraryStatus();

  return useMutation({
    ...mutation,
    onSuccess: (data) => {
      toast.success(`Saved changes for ${data.anime.title}.`);
      upsertLibraryEntryInCache(queryClient, data);
      upsertPublicLibraryEntryInCache(queryClient, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.me() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useUpdateLibraryProgress = () => {
  const queryClient = useQueryClient();
  const mutation = libraryMutations.updateLibraryProgress();

  return useMutation({
    ...mutation,
    onMutate: async ({ params, body }) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.me() });
      const previous = queryClient.getQueryData<LibraryEntryWithAnime[]>(libraryKeys.me());

      if (previous) {
        const target = previous.find((entry) => entry.animeId === params.animeId);
        if (target) {
          const optimistic: LibraryEntryWithAnime = {
            ...target,
            currentEpisode:
              body.currentEpisode !== undefined
                ? body.currentEpisode
                : Math.max(1, target.currentEpisode + (body.delta ?? 0)),
            updatedAt: new Date(),
          };
          upsertLibraryEntryInCache(queryClient, optimistic);
        }
      }

      return { previous, currentUserId: previous?.[0]?.userId };
    },
    onError: (_error, _payload, context: MutationContext | undefined) => {
      toast.error("Failed to update progress");
      if (context?.previous) {
        queryClient.setQueryData(libraryKeys.me(), context.previous);
      }
    },
    onSuccess: (data) => {
      toast.success(`Saved changes for ${data.anime.title}.`);
      upsertLibraryEntryInCache(queryClient, data);
      upsertPublicLibraryEntryInCache(queryClient, data);
    },
    onSettled: (_data, _error, _payload, context) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.me() });

      if (context?.currentUserId) {
        queryClient.invalidateQueries({
          queryKey: libraryKeys.publicByUserId(context.currentUserId),
        });
      }
    },
  });
};

export const useUpdateLibraryRating = () => {
  const queryClient = useQueryClient();
  const mutation = libraryMutations.updateLibraryRating();

  return useMutation({
    ...mutation,
    onSuccess: (data) => {
      toast.success(`Saved changes for ${data.anime.title}.`);
      upsertLibraryEntryInCache(queryClient, data);
      upsertPublicLibraryEntryInCache(queryClient, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.me() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
};

export const useRemoveFromLibrary = () => {
  const queryClient = useQueryClient();
  const mutation = libraryMutations.removeFromLibrary();

  return useMutation({
    ...mutation,
    onMutate: async ({ params }) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.me() });
      const previous = queryClient.getQueryData<LibraryEntryWithAnime[]>(libraryKeys.me());

      if (previous) {
        queryClient.setQueryData(
          libraryKeys.me(),
          previous.filter((entry) => entry.animeId !== params.animeId),
        );
      }

      return { previous, currentUserId: previous?.[0]?.userId };
    },
    onError: (_error, _payload, context: MutationContext | undefined) => {
      toast.error("Failed to remove anime");
      if (context?.previous) {
        queryClient.setQueryData(libraryKeys.me(), context.previous);
      }
    },
    onSuccess: (_data, { params }, context) => {
      const removedTitle = context?.previous?.find((entry) => entry.animeId === params.animeId)
        ?.anime.title;
      toast.success(
        removedTitle
          ? `Removed ${removedTitle} from your library.`
          : "Removed anime from your library.",
      );
    },
    onSettled: (_data, _error, { params }, context) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.me() });

      if (context?.currentUserId) {
        queryClient.invalidateQueries({
          queryKey: libraryKeys.publicByUserId(context.currentUserId),
        });
        removePublicLibraryEntryFromCache(queryClient, context.currentUserId, params.animeId);
      }
    },
  });
};

export function groupLibraryByStatus(
  entries: LibraryEntryWithAnime[] | undefined,
): Record<LibraryStatus, LibraryEntryWithAnime[]> {
  const grouped: Record<LibraryStatus, LibraryEntryWithAnime[]> = {
    watching: [],
    completed: [],
    watchlist: [],
    dropped: [],
  };

  for (const entry of entries ?? []) {
    grouped[entry.status].push(entry);
  }

  return grouped;
}

export function buildLogPayload(
  anime: LogAnimeData["anime"],
  status: LibraryStatus,
  currentEpisode?: number,
  rating?: number | null,
): LogAnimeData {
  return {
    anime,
    status,
    currentEpisode,
    rating,
  };
}

export function getEntryByAnimeId(entries: LibraryEntryWithAnime[] | undefined, animeId: number) {
  return entries?.find((entry) => entry.animeId === animeId) ?? null;
}

export function getNextEpisode(currentEpisode: number): number {
  return Math.max(1, currentEpisode + 1);
}

export type { UpdateLibraryStatusData, UpdateLibraryProgressData, UpdateLibraryRatingData };
