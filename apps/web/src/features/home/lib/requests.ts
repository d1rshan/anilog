import { api } from "@/lib/api";

export async function getTrendingAnime() {
  const res = await api.anime.trending.get();

  if (res.error) {
    throw new Error(res.error.message);
  }

  return res.data;
}
