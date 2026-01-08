export interface Anime {
  id: number;
  title: string;
  titleJapanese?: string | null;
  description?: string | null;
  episodes?: number | null;
  status?: string | null;
  genres?: string[] | null;
  imageUrl?: string | null;
  year?: number | null;
  rating?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserList {
  id: string;
  userId: string;
  name: string;
  type: "favorites" | "watching" | "completed" | "planned" | "dropped" | "custom";
  description?: string | null | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListEntry {
  id: string;
  listId: string;
  animeId: number;
  currentEpisode: number;
  rating?: number | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListEntryWithAnime extends ListEntry {
  anime: Anime;
}

export interface UserListWithEntries extends UserList {
  entries: ListEntryWithAnime[];
}

export interface CreateListRequest {
  name: string;
  type?: UserList["type"];
  description?: string;
}

export interface UpdateListRequest {
  name?: string;
  description?: string;
}

export interface AddToListRequest {
  animeId: string;
  currentEpisode?: number;
  rating?: number;
  notes?: string;
}

export interface UpdateListEntryRequest {
  currentEpisode?: number;
  rating?: number;
  notes?: string;
}
