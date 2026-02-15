"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { searchAnimeQueryOptions, trendingAnimeQueryOptions } from "@/lib/query-options";
import { animeKeys } from "@/lib/query-keys";

import { upsertAnime } from "./requests";

export function useTrendingAnime() {
  return useQuery(trendingAnimeQueryOptions());
}

export function useSearchAnime(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    ...searchAnimeQueryOptions(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
  });
}

export function useUpsertAnime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertAnime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: animeKeys.trending() });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add anime");
    },
  });
}
