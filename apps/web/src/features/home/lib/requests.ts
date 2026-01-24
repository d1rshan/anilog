import { type Anime } from "@anilog/db/schema/anime";

export async function getTrendingAnime(): Promise<Anime[]> {
  const response = await fetch("http://localhost:3000/api/anime");
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || "Failed to fetch anime");
  }

  return data.data;
}
