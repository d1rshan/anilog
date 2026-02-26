import { t } from "elysia";
import { animeSchema } from "./common";

export const successCountSchema = t.Object({
  success: t.Boolean(),
  count: t.Integer(),
});

export const syncUnauthorizedResponseSchema = t.Object({
  success: t.Boolean(),
  error: t.String(),
});

export const upsertAnimeInputSchema = t.Object({
  id: t.Integer(),
  title: t.String(),
  titleJapanese: t.Optional(t.Nullable(t.String())),
  description: t.Optional(t.Nullable(t.String())),
  episodes: t.Optional(t.Nullable(t.Integer())),
  status: t.Optional(t.Nullable(t.String())),
  genres: t.Optional(t.Nullable(t.Array(t.String()))),
  imageUrl: t.String(),
  bannerImage: t.Optional(t.Nullable(t.String())),
  year: t.Optional(t.Nullable(t.Integer())),
  rating: t.Optional(t.Nullable(t.Integer())),
});

export const upsertAnimeResultSchema = t.Object({
  id: t.Integer(),
  success: t.Boolean(),
});

export const heroCurationSchema = t.Object({
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

export const updateHeroCurationInputSchema = t.Object({
  videoId: t.String(),
  start: t.Integer({ minimum: 0 }),
  stop: t.Integer({ minimum: 1 }),
  title: t.String(),
  subtitle: t.String(),
  description: t.String(),
  tag: t.String(),
  sortOrder: t.Integer({ minimum: 0 }),
  isActive: t.Boolean(),
});

export const archiveSearchQuerySchema = t.Object({
  q: t.String(),
  limit: t.Optional(t.Integer({ minimum: 1, maximum: 50 })),
});

export const archiveSearchResponseSchema = t.Object({
  library: t.Array(animeSchema),
  archive: t.Array(animeSchema),
});
