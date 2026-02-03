"use client";

import { useQuery } from "@tanstack/react-query";
import { getTrendingAnime } from "./requests";
import type { Anime } from "@anilog/db/schema/anilog";

export function useTrendingAnime() {
  return useQuery<Anime[]>({
    queryKey: ["trending-anime"],
    queryFn: getTrendingAnime,
  });
}
