import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/eden-fetch";
import {
  applyOptimisticMyLibraryUpdate,
  handleLibraryMutationSuccess,
  handleLibraryMutationError,
  invalidateLibraryCaches,
  removeLibraryEntryFromCache,
  removePublicLibraryEntryFromCache,
  upsertLibraryEntryInCache,
} from "./library.cache";
import { libraryMutations, libraryQueries } from "./library.api";
import {
  createOptimisticLibraryEntry,
  getEntryTitle,
  getOptimisticProgressEntry,
} from "./library.utils";

export const useMyLibrary = (options?: { enabled?: boolean }) => {
  return useQuery({
    ...libraryQueries.myLibrary(),
    enabled: options?.enabled ?? true,
  });
};

export const useLogAnime = () => {
  const queryClient = useQueryClient();
  const mutation = libraryMutations.logAnime();

  return useMutation({
    ...mutation,
    onMutate: async ({ body }) => {
      return applyOptimisticMyLibraryUpdate(queryClient, () => {
        upsertLibraryEntryInCache(queryClient, createOptimisticLibraryEntry(body));
      });
    },
    onError: (_error, _payload, context) => {
      handleLibraryMutationError(queryClient, context, "Failed to log anime");
    },
    onSuccess: (data, payload, context) => {
      handleLibraryMutationSuccess(queryClient, data, {
        message:
          payload.body.status === "watchlist"
            ? `Added ${data.anime.title} to watchlist.`
            : `Saved changes for ${data.anime.title}.`,
        currentUserId: context?.currentUserId,
        invalidatePublicLibrary: true,
      });
    },
    onSettled: () => {
      invalidateLibraryCaches(queryClient);
    },
  });
};

export const useUpdateLibraryStatus = () => {
  const queryClient = useQueryClient();
  const mutation = libraryMutations.updateLibraryStatus();

  return useMutation({
    ...mutation,
    onSuccess: (data) => {
      handleLibraryMutationSuccess(queryClient, data, {
        message: `Saved changes for ${data.anime.title}.`,
      });
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
      return applyOptimisticMyLibraryUpdate(queryClient, (previous) => {
        const optimistic = getOptimisticProgressEntry(previous, params.animeId, body);
        if (optimistic) {
          upsertLibraryEntryInCache(queryClient, optimistic);
        }
      });
    },
    onError: (_error, _payload, context) => {
      handleLibraryMutationError(queryClient, context, "Failed to update progress");
    },
    onSuccess: (data, _payload, context) => {
      handleLibraryMutationSuccess(queryClient, data, {
        message: `Saved changes for ${data.anime.title}.`,
        currentUserId: context?.currentUserId,
        invalidatePublicLibrary: true,
      });
    },
    onSettled: () => {
      invalidateLibraryCaches(queryClient);
    },
  });
};

export const useUpdateLibraryRating = () => {
  const queryClient = useQueryClient();
  const mutation = libraryMutations.updateLibraryRating();

  return useMutation({
    ...mutation,
    onSuccess: (data) => {
      handleLibraryMutationSuccess(queryClient, data, {
        message: `Saved changes for ${data.anime.title}.`,
      });
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
      return applyOptimisticMyLibraryUpdate(queryClient, () => {
        removeLibraryEntryFromCache(queryClient, params.animeId);
      });
    },
    onError: (_error, _payload, context) => {
      handleLibraryMutationError(queryClient, context, "Failed to remove anime");
    },
    onSuccess: (_data, { params }, context) => {
      const removedTitle = getEntryTitle(context?.previous, params.animeId);

      toast.success(
        removedTitle
          ? `Removed ${removedTitle} from your library.`
          : "Removed anime from your library.",
      );
    },
    onSettled: (_data, _error, { params }, context) => {
      invalidateLibraryCaches(queryClient, context?.currentUserId);

      if (context?.currentUserId) {
        removePublicLibraryEntryFromCache(queryClient, context.currentUserId, params.animeId);
      }
    },
  });
};
