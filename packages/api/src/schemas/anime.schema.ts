import { t } from "elysia";

// Full anime record — matches the `anime` table exactly
export const AnimeDto = t.Object({
  id: t.Integer(),
  title: t.String(),
  titleJapanese: t.String(),
  episodes: t.Integer(),
  status: t.String(),
  genres: t.Array(t.String()),
  imageUrl: t.String(),
  year: t.Integer(),
  rating: t.Integer(),
  createdAt: t.Any(),
  updatedAt: t.Any(),
});

// Lightweight anime shape embedded in library entries
// All fields are notNull in the DB (with defaults), so no Nullable wrappers needed
export const AnimeSummaryDto = t.Object({
  id: t.Integer(),
  title: t.String(),
  titleJapanese: t.String(),
  imageUrl: t.String(),
  year: t.Integer(),
  episodes: t.Integer(),
  status: t.String(),
  genres: t.Array(t.String()),
  rating: t.Integer(),
});

// Hero curation record — matches the `hero_curation` table
export const HeroCurationDto = t.Object({
  id: t.Integer(),
  key: t.String(),
  videoId: t.String(),
  start: t.Integer(),
  stop: t.Integer(),
  title: t.String(),
  subtitle: t.String(),
  description: t.String(),
  tag: t.String(),
  sortOrder: t.Integer(),
  isActive: t.Boolean(),
  createdAt: t.Any(),
  updatedAt: t.Any(),
});

// Route params
export const HeroCurationParams = t.Object({ id: t.Numeric() });
export const AnimeSearchParams = t.Object({ query: t.String() });

// Archive search
export const ArchiveSearchQuery = t.Object({
  q: t.String(),
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 50 })),
});

export const ArchiveSearchDto = t.Object({
  library: t.Array(AnimeDto),
  archive: t.Array(AnimeDto),
});

// Anime upsert — used both as a direct endpoint and embedded in LogAnimeBody
export const UpsertAnimeBody = t.Object({
  id: t.Integer(),
  title: t.String(),
  titleJapanese: t.String(),
  episodes: t.Integer(),
  status: t.String(),
  genres: t.Array(t.String()),
  imageUrl: t.String(),
  year: t.Integer(),
  rating: t.Integer(),
});

export const UpsertAnimeDto = t.Object({
  id: t.Integer(),
  success: t.Boolean(),
});

export type AnimeDto = (typeof AnimeDto)["static"];
export type AnimeSummaryDto = (typeof AnimeSummaryDto)["static"];
export type HeroCurationDto = (typeof HeroCurationDto)["static"];
export type HeroCurationParams = (typeof HeroCurationParams)["static"];
export type AnimeSearchParams = (typeof AnimeSearchParams)["static"];
export type ArchiveSearchQuery = (typeof ArchiveSearchQuery)["static"];
export type ArchiveSearchDto = (typeof ArchiveSearchDto)["static"];
export type UpsertAnimeBody = (typeof UpsertAnimeBody)["static"];
export type UpsertAnimeDto = (typeof UpsertAnimeDto)["static"];
