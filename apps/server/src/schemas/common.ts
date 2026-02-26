import { t } from "elysia";

export const errorResponseSchema = t.Object({
  error: t.String(),
});

export const libraryStatusSchema = t.Union([
  t.Literal("watching"),
  t.Literal("completed"),
  t.Literal("planned"),
  t.Literal("dropped"),
]);

export const animeSummarySchema = t.Object({
  id: t.Integer(),
  title: t.String(),
  titleJapanese: t.Nullable(t.String()),
  imageUrl: t.String(),
  year: t.Nullable(t.Integer()),
  episodes: t.Nullable(t.Integer()),
  status: t.Nullable(t.String()),
});

export const animeSchema = t.Object({
  id: t.Integer(),
  title: t.String(),
  titleJapanese: t.Nullable(t.String()),
  description: t.Nullable(t.String()),
  episodes: t.Nullable(t.Integer()),
  status: t.Nullable(t.String()),
  genres: t.Nullable(t.Array(t.String())),
  imageUrl: t.String(),
  bannerImage: t.Nullable(t.String()),
  year: t.Nullable(t.Integer()),
  rating: t.Nullable(t.Integer()),
  createdAt: t.Any(),
  updatedAt: t.Any(),
});

export const userProfileSchema = t.Object({
  userId: t.String(),
  bio: t.Nullable(t.String()),
  displayName: t.Nullable(t.String()),
  website: t.Nullable(t.String()),
  location: t.Nullable(t.String()),
  twitterUrl: t.Nullable(t.String()),
  discordUrl: t.Nullable(t.String()),
  githubUrl: t.Nullable(t.String()),
  instagramUrl: t.Nullable(t.String()),
  isPublic: t.Boolean(),
  createdAt: t.Any(),
  updatedAt: t.Any(),
});

export const userWithProfileSchema = t.Object({
  id: t.String(),
  name: t.String(),
  username: t.Nullable(t.String()),
  email: t.String(),
  isAdmin: t.Boolean(),
  image: t.Nullable(t.String()),
  profile: t.Nullable(userProfileSchema),
  followerCount: t.Integer(),
  followingCount: t.Integer(),
});
