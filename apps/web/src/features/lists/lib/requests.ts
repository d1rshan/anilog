import { api } from "@/lib/api";
import type { UserList, ListEntry, Anime } from "@anilog/db/schema/anilog";

export type CreateListData = { name: string };

export type ListWithEntries = UserList & {
  entries: (ListEntry & { anime: Pick<Anime, "id" | "title" | "titleJapanese" | "imageUrl" | "year" | "episodes"> })[];
};

export async function getUserLists(): Promise<ListWithEntries[]> {
  const res = await api.lists.get();

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function createList(data: CreateListData) {
  const res = await api.lists.post(data);

  if (res.error) {
    throw res.error
  }

  return res.data;
}

export async function updateList({ listId, name }: { listId: string; name: string }) {
  const res = await api.lists[listId].put({ name });

  if (res.error) {
    throw res.error
  }

  return res.data;
}

export async function deleteList(listId: string) {
  const res = await api.lists[listId].delete();

  if (res.error) {
    throw res.error
  }

  return res.data;
}

export async function addAnimeToList({ listId, animeId, currentEpisode, rating }: { listId: string; animeId: number; currentEpisode?: number; rating?: number }) {
  const res = await api.lists[listId].anime.post({ animeId, currentEpisode, rating });

  if (res.error) {
    throw res.error
  }

  return res.data;
}

export async function removeAnimeFromList(entryId: string) {
  const res = await api.lists.entries[entryId].delete();

  if (res.error) {
    throw res.error
  }

  return res.data;
}

export async function addToFavorites(animeId: number) {
  const res = await api.lists.favorites.post({ animeId });

  if (res.error) {
    throw res.error;
  }

  return res.data;
}
