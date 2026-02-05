"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getTrendingAnime, searchAnime } from "./requests";
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
