import { Elysia, t } from "elysia";
import { UserService } from "@anilog/domain";
import {
  AdminStatusDto,
  FollowActionDto,
  IsFollowingDto,
  PublicLibraryEntryDto,
  UpdateUserProfileBody,
  UserParams,
  UserSearchQuery,
  UserProfileDto,
  UserWithProfileDto,
  UsernameParams,
} from "@anilog/contracts";
import { authPlugin } from "../plugins/auth.plugin";

export const userRoutes = new Elysia({ prefix: "/users" })
  .get(
    "/search",
    async ({ query }) => {
      return UserService.searchUsers(query, 20);
    },
    {
      query: UserSearchQuery,
      response: t.Array(UserWithProfileDto),
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      return UserService.getUserProfileOrThrow(params.id);
    },
    {
      params: UserParams,
      response: UserWithProfileDto,
    },
  )
  .get(
    "/username/:username",
    async ({ params }) => {
      return UserService.getUserByUsernameOrThrow(params.username);
    },
    {
      params: UsernameParams,
      response: UserWithProfileDto,
    },
  )
  .get(
    "/:id/library",
    async ({ params }) => {
      return UserService.getPublicUserLibrary(params.id);
    },
    {
      params: UserParams,
      response: t.Array(PublicLibraryEntryDto),
    },
  )
  .get(
    "/:id/followers",
    async ({ params }) => {
      return UserService.getFollowers(params.id);
    },
    {
      params: UserParams,
      response: t.Array(UserWithProfileDto),
    },
  )
  .get(
    "/:id/following",
    async ({ params }) => {
      return UserService.getFollowing(params.id);
    },
    {
      params: UserParams,
      response: t.Array(UserWithProfileDto),
    },
  )
  .use(authPlugin)
  .post(
    "/:id/follow",
    async ({ params, userId }) => {
      return UserService.followUser(userId, params.id);
    },
    {
      params: UserParams,
      response: FollowActionDto,
    },
  )
  .delete(
    "/:id/follow",
    async ({ params, userId }) => {
      return UserService.unfollowUser(userId, params.id);
    },
    {
      params: UserParams,
      response: FollowActionDto,
    },
  )
  .get(
    "/me/profile",
    async ({ userId }) => {
      return UserService.getUserProfileOrThrow(userId, "Profile not found");
    },
    {
      response: UserWithProfileDto,
    },
  )
  .get(
    "/me/admin-status",
    async ({ userId }) => {
      return UserService.getAdminStatus(userId);
    },
    {
      response: AdminStatusDto,
    },
  )
  .put(
    "/me/profile",
    async ({ body, userId }) => {
      return UserService.updateUserProfile(userId, body);
    },
    {
      body: UpdateUserProfileBody,
      response: UserProfileDto,
    },
  )
  .get(
    "/me/following",
    async ({ userId }) => {
      return UserService.getFollowing(userId);
    },
    {
      response: t.Array(UserWithProfileDto),
    },
  )
  .get(
    "/me/check-follow/:id",
    async ({ params, userId }) => {
      const isFollowing = await UserService.isFollowing(userId, params.id);
      return { isFollowing };
    },
    {
      params: UserParams,
      response: IsFollowingDto,
    },
  );
