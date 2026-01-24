"use client";

import { useQuery } from "@tanstack/react-query";
import { getTrendingAnime } from "./requests";

export function useTrendingAnime() {
  return useQuery({
    queryKey: ["trending-anime"],
    queryFn: getTrendingAnime,
  });
}
