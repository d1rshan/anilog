"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getTrendingAnime, searchAnime, upsertAnime } from "./requests";
import type { Anime } from "@anilog/db/schema/anilog";

export function useTrendingAnime() {
  return useQuery<Anime[]>({
    queryKey: ["trending-anime"],
    queryFn: getTrendingAnime,
  });
}

export function useSearchAnime(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return useQuery<Anime[]>({
    queryKey: ["search-anime", debouncedQuery],
    queryFn: () => searchAnime(debouncedQuery),
    enabled: debouncedQuery.length >= 3,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useUpsertAnime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertAnime,
    onSuccess: () => {
      // Invalidate trending anime cache since we may have added new anime
      queryClient.invalidateQueries({ queryKey: ["trending-anime"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add anime");
    },
  });
}
