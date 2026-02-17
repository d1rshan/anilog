import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Anime, LibraryStatus } from "@anilog/db/schema/anilog";

import { myLibraryQueryOptions } from "@/lib/query-options";
import { libraryKeys } from "@/lib/query-keys";

import {
  logAnime,
  removeFromLibrary,
  updateLibraryProgress,
  updateLibraryRating,
  updateLibraryStatus,
  type LibraryEntryWithAnime,
  type LogAnimeData,
  type UpdateLibraryProgressData,
  type UpdateLibraryRatingData,
  type UpdateLibraryStatusData,
} from "./requests";
import type { PublicUserLibrary } from "@/features/users/lib/requests";

type MutationContext = {
  previous?: LibraryEntryWithAnime[];
  currentUserId?: string;
};

function upsertLibraryEntryInCache(queryClient: ReturnType<typeof useQueryClient>, entry: LibraryEntryWithAnime) {
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
  queryClient.setQueryData<PublicUserLibrary>(
    libraryKeys.publicByUserId(userId),
    (current) => {
      if (!current) {
        return current;
      }

      return current.filter((entry) => entry.animeId !== animeId);
    },
  );
}

export const useMyLibrary = (options?: { enabled?: boolean }) => {
  return useQuery({
    ...myLibraryQueryOptions(),
    enabled: options?.enabled ?? true,
  });
};

// Backward-compatible alias to keep imports stable while refactoring.
export const useUserLists = useMyLibrary;

export const useLogAnime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logAnime,
    onMutate: async (payload: LogAnimeData) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.me() });
      const previous = queryClient.getQueryData<LibraryEntryWithAnime[]>(libraryKeys.me());

      if (previous) {
        const optimistic: LibraryEntryWithAnime = {
          id: `optimistic-${payload.anime.id}`,
          userId: "",
          animeId: payload.anime.id,
          status: payload.status,
          currentEpisode: Math.max(0, payload.currentEpisode ?? 0),
          rating: payload.rating ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          anime: {
            id: payload.anime.id,
            title: payload.anime.title,
            titleJapanese: payload.anime.titleJapanese ?? null,
            imageUrl: payload.anime.imageUrl,
            year: payload.anime.year ?? null,
            episodes: payload.anime.episodes ?? null,
            status: payload.anime.status ?? null,
          },
        };

        upsertLibraryEntryInCache(queryClient, optimistic);
      }

      return {
        previous,
        currentUserId: previous?.[0]?.userId,
      };
    },
    onError: (error, _payload, context: MutationContext | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData(libraryKeys.me(), context.previous);
      }
      toast.error(error.message || "Failed to log anime");
    },
    onSuccess: (data, payload, context: MutationContext | undefined) => {
      upsertLibraryEntryInCache(queryClient, data);
      upsertPublicLibraryEntryInCache(queryClient, data);

      const existedBefore = context?.previous?.some((entry) => entry.animeId === payload.anime.id) ?? false;
      if (payload.status === "planned" && !existedBefore) {
        toast.success(`Added ${data.anime.title} to watchlist.`);
        return;
      }

      toast.success(`Saved changes for ${data.anime.title}.`);
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

  return useMutation({
    mutationFn: updateLibraryStatus,
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
    onSuccess: (data) => {
      upsertLibraryEntryInCache(queryClient, data);
      upsertPublicLibraryEntryInCache(queryClient, data);
      toast.success(`Saved changes for ${data.anime.title}.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.me() });
    },
  });
};

export const useUpdateLibraryProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLibraryProgress,
    onMutate: async (payload: UpdateLibraryProgressData) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.me() });
      const previous = queryClient.getQueryData<LibraryEntryWithAnime[]>(libraryKeys.me());

      if (previous) {
        const target = previous.find((entry) => entry.animeId === payload.animeId);
        if (target) {
          const optimistic: LibraryEntryWithAnime = {
            ...target,
            currentEpisode:
              payload.currentEpisode !== undefined
                ? payload.currentEpisode
                : Math.max(1, target.currentEpisode + (payload.delta ?? 0)),
            updatedAt: new Date(),
          };
          upsertLibraryEntryInCache(queryClient, optimistic);
        }
      }

      return { previous, currentUserId: previous?.[0]?.userId };
    },
    onError: (error, _payload, context: MutationContext | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData(libraryKeys.me(), context.previous);
      }
      toast.error(error.message || "Failed to update progress");
    },
    onSuccess: (data) => {
      upsertLibraryEntryInCache(queryClient, data);
      upsertPublicLibraryEntryInCache(queryClient, data);
      toast.success(`Saved changes for ${data.anime.title}.`);
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

  return useMutation({
    mutationFn: updateLibraryRating,
    onError: (error) => {
      toast.error(error.message || "Failed to update rating");
    },
    onSuccess: (data) => {
      upsertLibraryEntryInCache(queryClient, data);
      upsertPublicLibraryEntryInCache(queryClient, data);
      toast.success(`Saved changes for ${data.anime.title}.`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.me() });
    },
  });
};

export const useRemoveFromLibrary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromLibrary,
    onMutate: async (animeId) => {
      await queryClient.cancelQueries({ queryKey: libraryKeys.me() });
      const previous = queryClient.getQueryData<LibraryEntryWithAnime[]>(libraryKeys.me());

      if (previous) {
        queryClient.setQueryData(
          libraryKeys.me(),
          previous.filter((entry) => entry.animeId !== animeId),
        );
      }

      return { previous, currentUserId: previous?.[0]?.userId };
    },
    onError: (error, _animeId, context: MutationContext | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData(libraryKeys.me(), context.previous);
      }
      toast.error(error.message || "Failed to remove anime");
    },
    onSuccess: (_data, animeId, context: MutationContext | undefined) => {
      const removedTitle = context?.previous?.find((entry) => entry.animeId === animeId)?.anime.title;
      toast.success(removedTitle ? `Removed ${removedTitle} from your library.` : "Removed anime from your library.");
    },
    onSettled: (_data, _error, animeId, context) => {
      queryClient.invalidateQueries({ queryKey: libraryKeys.me() });

      if (context?.currentUserId) {
        queryClient.invalidateQueries({
          queryKey: libraryKeys.publicByUserId(context.currentUserId),
        });
        removePublicLibraryEntryFromCache(queryClient, context.currentUserId, animeId);
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
    planned: [],
    dropped: [],
  };

  for (const entry of entries ?? []) {
    grouped[entry.status].push(entry);
  }

  return grouped;
}

export function buildLogPayload(
  anime: Pick<
    Anime,
    "id" | "title" | "titleJapanese" | "description" | "episodes" | "status" | "genres" | "imageUrl" | "year" | "rating"
  >,
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
