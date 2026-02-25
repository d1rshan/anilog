import type { Anime, LibraryStatus, UserAnime } from "@anilog/db/schema/anilog";

export type LibraryAnimeSummary = Pick<
  Anime,
  "id" | "title" | "titleJapanese" | "imageUrl" | "year" | "episodes" | "status"
>;

export type LibraryEntryWithAnime = UserAnime & {
  anime: LibraryAnimeSummary;
};

export type LogAnimeInput = {
  anime: {
    id: number;
    title: string;
    titleJapanese?: string | null;
    description?: string | null;
    episodes?: number | null;
    status?: string | null;
    genres?: string[] | null;
    imageUrl: string;
    year?: number | null;
    rating?: number | null;
  };
  status: LibraryStatus;
  currentEpisode?: number;
  rating?: number | null;
};

export type UpdateStatusInput = {
  status: LibraryStatus;
  currentEpisode?: number;
};

export type UpdateProgressInput = {
  currentEpisode?: number;
  delta?: number;
};

export type UpdateRatingInput = {
  rating: number | null;
};
