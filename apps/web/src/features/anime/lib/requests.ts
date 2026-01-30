import { api } from "@/lib/api";

export async function getTrendingAnime() {
  const res = await api.anime.trending.get();

  if (res.error) {
    throw res.error
  }

  return res.data;
}
