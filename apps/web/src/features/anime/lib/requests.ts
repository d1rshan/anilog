import { api } from "@/lib/api";
import { unwrapEdenResponse } from "@/lib/eden";

type UpsertAnimePayload = Parameters<typeof api.anime.upsert.post>[0];

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

export async function upsertAnime(animeData: UpsertAnimePayload) {
  const res = await api.anime.upsert.post(animeData);
  return unwrapEdenResponse(res);
}

export type HeroCuration = Awaited<ReturnType<typeof getHeroCurations>>[number];
