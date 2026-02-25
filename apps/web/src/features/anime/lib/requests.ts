import { api } from "@/lib/api";
import { unwrapEdenResponse } from "@/lib/eden";
import type { ArchiveSearchResponse } from "@anilog/api";
import type { Anime, HeroCuration } from "@anilog/db/schema/anilog";

export async function getTrendingAnime() {
  const res = await api.anime.trending.get();
  return unwrapEdenResponse(res);
}

export async function getHeroCurations() {
  const res = await api.anime["hero-curations"].get();
  return unwrapEdenResponse(res);
}

export async function searchAnime(query: string) {
  const res = await api.anime.search({ query }).get();
  return unwrapEdenResponse(res);
}

export async function searchArchive(query: string) {
  const res = await api.anime["archive-search"].get({
    query: { q: query, limit: 12 },
  });

  return unwrapEdenResponse(res);
}

export async function upsertAnime(animeData: Anime) {
  const res = await api.anime.upsert.post(animeData);
  return unwrapEdenResponse(res);
}

export type { ArchiveSearchResponse, HeroCuration };
