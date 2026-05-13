import { t } from "elysia";

export const UserProfileDto = t.Object({
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
  createdAt: t.Date(),
  updatedAt: t.Date(),
});

export const UserWithProfileDto = t.Object({
  id: t.String(),
  name: t.String(),
  username: t.Nullable(t.String()),
  email: t.String(),
  isAdmin: t.Boolean(),
  image: t.Nullable(t.String()),
  profile: t.Nullable(UserProfileDto),
  followerCount: t.Integer(),
  followingCount: t.Integer(),
});

export const UserSearchQuery = t.Object({ q: t.String() });

export const UpdateUserProfileBody = t.Object({
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

export const FollowActionDto = t.Object({
  success: t.Boolean(),
  message: t.String(),
});

export const IsFollowingDto = t.Object({ isFollowing: t.Boolean() });

export type UserProfileDto = (typeof UserProfileDto)["static"];
export type UserWithProfileDto = (typeof UserWithProfileDto)["static"];
export type UserSearchQuery = (typeof UserSearchQuery)["static"];
export type UpdateUserProfileBody = (typeof UpdateUserProfileBody)["static"];
export type FollowActionDto = (typeof FollowActionDto)["static"];
export type IsFollowingDto = (typeof IsFollowingDto)["static"];
