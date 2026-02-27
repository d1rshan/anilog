"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { animeQueries, animeMutations } from "@/features/anime/lib/options";
import { animeKeys } from "@/lib/query-keys";

export function useTrendingAnime() {
  return useQuery(animeQueries.trending());
}

export function useHeroCurations() {
  return useQuery(animeQueries.heroCurations());
}

export function useSearchAnime(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    ...animeQueries.search(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
    placeholderData: (previousData) => previousData,
  });
}

export function useArchiveSearch(query: string, options?: { enabled?: boolean }) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    ...animeQueries.archiveSearch(debouncedQuery),
    enabled: (options?.enabled ?? true) && debouncedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
  });
}

export function useUpsertAnime() {
  const queryClient = useQueryClient();

  return useMutation({
    ...animeMutations.upsertAnime(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animeKeys.trending() });
    },
  });
}
