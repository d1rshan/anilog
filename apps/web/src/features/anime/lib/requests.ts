import { api } from "@/lib/api";
import type { Anime } from "@anilog/db/schema/anilog";

export async function getTrendingAnime(): Promise<Anime[]> {
  const res = await api.anime.trending.get();

  if (res.error) {
    throw res.error
  }

  return res.data as Anime[];
}

export async function searchAnime(query: string): Promise<Anime[]> {
  const res = await api.anime.search({ query }).get();

  if (res.error) {
    throw res.error
  }

  return res.data as Anime[];
}

export async function upsertAnime(animeData: Anime): Promise<{ id: number; success: boolean }> {
  const res = await api.anime.upsert.post(animeData);

  if (res.error) {
    throw res.error;
  }

  return res.data as { id: number; success: boolean };
}
