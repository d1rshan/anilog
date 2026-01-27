import { api } from "@/lib/api";

export type CreateListData = {
  name: string;
  type: "custom" | "favorites" | "watching" | "completed" | "planned" | "dropped";
  description?: string;
};

export async function getUserLists() {
  const res = await api.lists.get();

  if (res.error) {
    throw new Error(res.error.message);
  }

  return res.data;
}

export async function initializeDefaultLists() {
  const res = await api.lists.initialize.post();

  if (res.error) {
    throw new Error(res.error.message);
  }

  return res.data;
}

export async function createList(data: CreateListData) {
  const res = await api.lists.post(data);

  if (res.error) {
    throw new Error(res.error.message);
  }

  return res.data;
}

export async function updateList({ listId, name, description }: { listId: string; name?: string; description?: string }) {
  const res = await api.lists[listId].put({ name, description });

  if (res.error) {
    throw new Error(res.error.message);
  }

  return res.data;
}

export async function deleteList(listId: string) {
  const res = await api.lists[listId].delete();

  if (res.error) {
    throw new Error(res.error.message);
  }

  return res.data;
}

export async function addAnimeToList({ listId, animeId, currentEpisode, rating, notes }: { listId: string; animeId: string; currentEpisode?: number; rating?: number; notes?: string }) {
  const res = await api.lists[listId].anime.post({ animeId, currentEpisode, rating, notes });

  if (res.error) {
    throw new Error(res.error.message);
  }

  return res.data;
}

export async function removeAnimeFromList(entryId: string) {
  const res = await api.lists.entries[entryId].delete();

  if (res.error) {
    throw new Error(res.error.message);
  }

  return res.data;
}
