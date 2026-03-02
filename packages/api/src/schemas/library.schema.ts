import { t } from "elysia";
import { AnimeSummaryDto, UpsertAnimeBody } from "./anime.schema";

// Strict union matching the `library_status` pgEnum values
export const LibraryStatusSchema = t.Union([
  t.Literal("watching"),
  t.Literal("completed"),
  t.Literal("watchlist"),
  t.Literal("dropped"),
]);

// Route params
export const LibraryAnimeParams = t.Object({ animeId: t.Numeric() });

// Full library entry returned to the authenticated user
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

// Stripped-down entry for public profile views (no userId exposed)
export const PublicLibraryEntryDto = t.Object({
  id: t.String(),
  animeId: t.Integer(),
  status: LibraryStatusSchema,
  currentEpisode: t.Integer(),
  rating: t.Nullable(t.Integer()),
  createdAt: t.Date(),
  anime: AnimeSummaryDto,
});

// Log (add/overwrite) an anime to the library
export const LogAnimeBody = t.Object({
  anime: UpsertAnimeBody,
  status: LibraryStatusSchema,
  currentEpisode: t.Optional(t.Integer({ minimum: 0 })),
  rating: t.Optional(t.Nullable(t.Integer({ minimum: 1, maximum: 5 }))),
});

// Update just the status (and optionally the episode) of a library entry
export const UpdateLibraryStatusBody = t.Object({
  status: LibraryStatusSchema,
  currentEpisode: t.Optional(t.Integer({ minimum: 0 })),
});

// Bump episode progress for a "watching" entry
export const UpdateLibraryProgressBody = t.Object({
  currentEpisode: t.Optional(t.Integer({ minimum: 1 })),
  delta: t.Optional(t.Integer()),
});

// Set or clear the user rating for a library entry
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
