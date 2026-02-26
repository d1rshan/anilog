import { t } from "elysia";
import {
  animeSummarySchema,
  libraryStatusSchema,
  userProfileSchema,
  userWithProfileSchema,
} from "./common";

export const userIdParamsSchema = t.Object({
  id: t.String(),
});

export const usernameParamsSchema = t.Object({
  username: t.String(),
});

export const userSearchQuerySchema = t.Object({
  q: t.String(),
});

export const publicUserLibraryEntrySchema = t.Object({
  id: t.String(),
  animeId: t.Integer(),
  status: libraryStatusSchema,
  currentEpisode: t.Integer(),
  rating: t.Nullable(t.Integer()),
  createdAt: t.Any(),
  anime: animeSummarySchema,
});

export const followActionResultSchema = t.Object({
  success: t.Boolean(),
  message: t.String(),
});

export const profileUpdateInputSchema = t.Object({
  bio: t.Optional(t.Nullable(t.String())),
  displayName: t.Optional(t.Nullable(t.String())),
  website: t.Optional(t.Nullable(t.String())),
  location: t.Optional(t.Nullable(t.String())),
  twitterUrl: t.Optional(t.Nullable(t.String())),
  discordUrl: t.Optional(t.Nullable(t.String())),
  githubUrl: t.Optional(t.Nullable(t.String())),
  instagramUrl: t.Optional(t.Nullable(t.String())),
  isPublic: t.Optional(t.Boolean()),
});

export const adminStatusSchema = t.Object({
  isAdmin: t.Boolean(),
});

export const isFollowingResultSchema = t.Object({
  isFollowing: t.Boolean(),
});

export { userProfileSchema, userWithProfileSchema };
