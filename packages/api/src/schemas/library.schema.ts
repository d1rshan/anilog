import { t } from "elysia";

import { AnimeSummaryDto, UpsertAnimeBody } from "./anime.schema";

export const LibraryStatusSchema = t.Union([
  t.Literal("watching"),
  t.Literal("completed"),
  t.Literal("watchlist"),
  t.Literal("dropped"),
]);

export const LibraryAnimeParams = t.Object({ animeId: t.Numeric() });

export const LibraryEntryDto = t.Object({
  id: t.String(),
  userId: t.String(),
  animeId: t.Integer(),
  status: LibraryStatusSchema,
  currentEpisode: t.Integer(),
  rating: t.Nullable(t.Integer()),
  createdAt: t.Date(),
  updatedAt: t.Date(),
  anime: AnimeSummaryDto,
});

export const PublicLibraryEntryDto = t.Object({
  id: t.String(),
  animeId: t.Integer(),
  status: LibraryStatusSchema,
  currentEpisode: t.Integer(),
  rating: t.Nullable(t.Integer()),
  createdAt: t.Date(),
  anime: AnimeSummaryDto,
});

export const LogAnimeBody = t.Object({
  anime: UpsertAnimeBody,
  status: LibraryStatusSchema,
  currentEpisode: t.Optional(t.Integer({ minimum: 0 })),
  rating: t.Optional(t.Nullable(t.Integer({ minimum: 1, maximum: 5 }))),
});

export const UpdateLibraryStatusBody = t.Object({
  status: LibraryStatusSchema,
  currentEpisode: t.Optional(t.Integer({ minimum: 0 })),
});

export const UpdateLibraryProgressBody = t.Object({
  currentEpisode: t.Optional(t.Integer({ minimum: 1 })),
  delta: t.Optional(t.Integer()),
});

export const UpdateLibraryRatingBody = t.Object({
  rating: t.Nullable(t.Integer({ minimum: 1, maximum: 5 })),
});

export type LibraryStatusSchema = (typeof LibraryStatusSchema)["static"];
export type LibraryAnimeParams = (typeof LibraryAnimeParams)["static"];
export type LibraryEntryDto = (typeof LibraryEntryDto)["static"];
export type PublicLibraryEntryDto = (typeof PublicLibraryEntryDto)["static"];
export type LogAnimeBody = (typeof LogAnimeBody)["static"];
export type UpdateLibraryStatusBody = (typeof UpdateLibraryStatusBody)["static"];
export type UpdateLibraryProgressBody = (typeof UpdateLibraryProgressBody)["static"];
export type UpdateLibraryRatingBody = (typeof UpdateLibraryRatingBody)["static"];
