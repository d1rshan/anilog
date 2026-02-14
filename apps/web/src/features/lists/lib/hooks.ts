import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Anime, LibraryStatus } from "@anilog/db/schema/anilog";
import {
  getMyLibrary,
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

const LIBRARY_QUERY_KEY = ["library", "me"] as const;

function upsertLibraryEntryInCache(queryClient: ReturnType<typeof useQueryClient>, entry: LibraryEntryWithAnime) {
  queryClient.setQueryData<LibraryEntryWithAnime[]>(LIBRARY_QUERY_KEY, (current = []) => {
    const index = current.findIndex((item) => item.animeId === entry.animeId);

    if (index === -1) {
      return [...current, entry];
    }

    const next = [...current];
    next[index] = entry;
    return next;
  });
}

export const useMyLibrary = () => {
  return useQuery<LibraryEntryWithAnime[]>({
    queryKey: LIBRARY_QUERY_KEY,
    queryFn: getMyLibrary,
  });
};

// Backward-compatible alias to keep imports stable while refactoring.
export const useUserLists = useMyLibrary;

export const useLogAnime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logAnime,
    onMutate: async (payload: LogAnimeData) => {
      await queryClient.cancelQueries({ queryKey: LIBRARY_QUERY_KEY });
      const previous = queryClient.getQueryData<LibraryEntryWithAnime[]>(LIBRARY_QUERY_KEY);

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

      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(LIBRARY_QUERY_KEY, context.previous);
      }
      toast.error(error.message || "Failed to log anime");
    },
    onSuccess: (data) => {
      upsertLibraryEntryInCache(queryClient, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["users", "library"] });
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
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["users", "library"] });
    },
  });
};

export const useUpdateLibraryProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLibraryProgress,
    onMutate: async (payload: UpdateLibraryProgressData) => {
      await queryClient.cancelQueries({ queryKey: LIBRARY_QUERY_KEY });
      const previous = queryClient.getQueryData<LibraryEntryWithAnime[]>(LIBRARY_QUERY_KEY);

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

      return { previous };
    },
    onError: (error, _payload, context) => {
      if (context?.previous) {
        queryClient.setQueryData(LIBRARY_QUERY_KEY, context.previous);
      }
      toast.error(error.message || "Failed to update progress");
    },
    onSuccess: (data) => {
      upsertLibraryEntryInCache(queryClient, data);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["users", "library"] });
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
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["users", "library"] });
    },
  });
};

export const useRemoveFromLibrary = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFromLibrary,
    onMutate: async (animeId) => {
      await queryClient.cancelQueries({ queryKey: LIBRARY_QUERY_KEY });
      const previous = queryClient.getQueryData<LibraryEntryWithAnime[]>(LIBRARY_QUERY_KEY);

      if (previous) {
        queryClient.setQueryData(
          LIBRARY_QUERY_KEY,
          previous.filter((entry) => entry.animeId !== animeId),
        );
      }

      return { previous };
    },
    onError: (error, _animeId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(LIBRARY_QUERY_KEY, context.previous);
      }
      toast.error(error.message || "Failed to remove anime");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["users", "library"] });
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
