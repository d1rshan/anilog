import { t } from "elysia";

export const errorResponseSchema = t.Object({
  error: t.String(),
});

export const successCountSchema = t.Object({
  success: t.Boolean(),
  count: t.Integer(),
});

export const upsertAnimeResultSchema = t.Object({
  id: t.Integer(),
  success: t.Boolean(),
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

export const adminStatsSchema = t.Object({
  totalUsers: t.Integer(),
});

export const adminStatusSchema = t.Object({
  isAdmin: t.Boolean(),
});

export const adminUsersResultSchema = t.Object({
  users: t.Array(userWithProfileSchema),
  total: t.Integer(),
  limit: t.Integer(),
  offset: t.Integer(),
});

export const setAdminStatusInputSchema = t.Object({
  isAdmin: t.Boolean(),
});

export const setAdminStatusResultSchema = t.Object({
  id: t.String(),
  isAdmin: t.Boolean(),
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

export const archiveSearchResponseSchema = t.Object({
  library: t.Array(animeSchema),
  archive: t.Array(animeSchema),
});
