import type { Anime, HeroCuration } from "@anilog/db/schema/anilog";

export type ArchiveSearchResponse = {
  library: Anime[];
  archive: Anime[];
};

export type UpsertAnimeInput = {
  id: number;
  title: string;
  titleJapanese?: string | null;
  description?: string | null;
  episodes?: number | null;
  status?: string | null;
  genres?: string[] | null;
  imageUrl: string;
  bannerImage?: string | null;
  year?: number | null;
  rating?: number | null;
};

export type SyncResult = {
  success: boolean;
  count: number;
};

export type HeroCurationUpdateInput = Pick<
  HeroCuration,
  | "videoId"
  | "start"
  | "stop"
  | "title"
  | "subtitle"
  | "description"
  | "tag"
  | "sortOrder"
  | "isActive"
>;

export type UpsertAnimeResult = {
  id: number;
  success: boolean;
};
