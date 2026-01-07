export interface Anime {
  id: number;
  title: string;
  titleJapanese?: string;
  description?: string;
  episodes?: number;
  status?: string;
  genres?: string;
  imageUrl?: string;
  year?: number;
  rating?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserList {
  id: string;
  userId: string;
  name: string;
  type: "favorites" | "watching" | "completed" | "planned" | "dropped" | "custom";
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ListEntry {
  id: string;
  listId: string;
  animeId: string;
  currentEpisode: number;
  rating?: number;
  notes?: string;
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
