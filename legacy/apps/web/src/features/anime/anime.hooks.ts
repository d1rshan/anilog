"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { UpsertAnimeBody } from "@anilog/contracts";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  animeMutations,
  animeQueries,
  type AnimeArchiveSearchInput,
  type AnimeSearchInput,
} from "./anime.api";
import { animeKeys } from "./anime.keys";
import { getApiErrorMessage } from "@/lib/eden-fetch";

export function useTrendingAnime() {
  return useQuery(animeQueries.trending());
}

export function useHeroCurations() {
  return useQuery(animeQueries.heroCurations());
}

export function useSearchAnime(
  input: AnimeSearchInput,
  options?: { enabled?: boolean; debounceMs?: number },
) {
  const [debouncedQuery, setDebouncedQuery] = useState(input.params.query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(input.params.query);
    }, options?.debounceMs ?? 400);

    return () => clearTimeout(timer);
  }, [input.params.query, options?.debounceMs]);

  return useQuery({
    ...animeQueries.search({ params: { query: debouncedQuery } }),
    enabled: (options?.enabled ?? true) && debouncedQuery.length >= 3,
    placeholderData: (previousData) => previousData,
  });
}

export function useArchiveSearch(
  input: AnimeArchiveSearchInput,
  options?: { enabled?: boolean; debounceMs?: number },
) {
  const [debouncedQuery, setDebouncedQuery] = useState(input.query.q);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(input.query.q);
    }, options?.debounceMs ?? 200);

    return () => clearTimeout(timer);
  }, [input.query.q, options?.debounceMs]);

  return useQuery({
    ...animeQueries.archiveSearch({
      query: { ...input.query, q: debouncedQuery },
    }),
    enabled: (options?.enabled ?? true) && debouncedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
  });
}

export function useUpsertAnime() {
  const queryClient = useQueryClient();
  const upsertAnimeMutation = animeMutations.upsertAnime();

  return useMutation({
    ...upsertAnimeMutation,
    mutationFn: (body: UpsertAnimeBody) => upsertAnimeMutation.mutationFn({ body }),
    onSuccess: () => {
      toast.success("Anime added successfully");
      queryClient.invalidateQueries({ queryKey: animeKeys.trending() });
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
