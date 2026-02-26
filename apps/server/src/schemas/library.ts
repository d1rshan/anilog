import { t } from "elysia";
import { animeSummarySchema, libraryStatusSchema } from "./common";

export const logAnimeInputSchema = t.Object({
  anime: t.Object({
    id: t.Integer(),
    title: t.String(),
    titleJapanese: t.Optional(t.Nullable(t.String())),
    description: t.Optional(t.Nullable(t.String())),
    episodes: t.Optional(t.Nullable(t.Integer())),
    status: t.Optional(t.Nullable(t.String())),
    genres: t.Optional(t.Nullable(t.Array(t.String()))),
    imageUrl: t.String(),
    year: t.Optional(t.Nullable(t.Integer())),
    rating: t.Optional(t.Nullable(t.Integer())),
  }),
  status: libraryStatusSchema,
  currentEpisode: t.Optional(t.Integer({ minimum: 0 })),
  rating: t.Optional(t.Nullable(t.Integer({ minimum: 1, maximum: 5 }))),
});

export const libraryEntrySchema = t.Object({
  id: t.String(),
  userId: t.String(),
  animeId: t.Integer(),
  status: libraryStatusSchema,
  currentEpisode: t.Integer(),
  rating: t.Nullable(t.Integer()),
  createdAt: t.Any(),
  updatedAt: t.Any(),
  anime: animeSummarySchema,
});

export const libraryAnimeIdParamsSchema = t.Object({
  animeId: t.Integer(),
});

export const updateStatusInputSchema = t.Object({
  status: libraryStatusSchema,
  currentEpisode: t.Optional(t.Integer({ minimum: 0 })),
});

export const updateProgressInputSchema = t.Object({
  currentEpisode: t.Optional(t.Integer({ minimum: 1 })),
  delta: t.Optional(t.Integer()),
});

export const updateRatingInputSchema = t.Object({
  rating: t.Nullable(t.Integer({ minimum: 1, maximum: 5 })),
});
