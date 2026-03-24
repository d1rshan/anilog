import { Elysia, t } from "elysia";
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
import { authMiddleware } from "../../middleware/auth.middleware";
import { UsersService } from "./users.service";

export const usersRoutes = new Elysia({ prefix: "/users" })
  .get(
    "/search",
    async ({ query }) => {
      return UsersService.searchUsers(query, 20);
    },
    {
      query: UserSearchQuery,
      response: t.Array(UserWithProfileDto),
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      return UsersService.getUserProfileOrThrow(params.id);
    },
    {
      params: UserParams,
      response: UserWithProfileDto,
    },
  )
  .get(
    "/username/:username",
    async ({ params }) => {
      return UsersService.getUserByUsernameOrThrow(params.username);
    },
    {
      params: UsernameParams,
      response: UserWithProfileDto,
    },
  )
  .get(
    "/:id/library",
    async ({ params }) => {
      return UsersService.getPublicUserLibrary(params.id);
    },
    {
      params: UserParams,
      response: t.Array(PublicLibraryEntryDto),
    },
  )
  .get(
    "/:id/followers",
    async ({ params }) => {
      return UsersService.getFollowers(params.id);
    },
    {
      params: UserParams,
      response: t.Array(UserWithProfileDto),
    },
  )
  .get(
    "/:id/following",
    async ({ params }) => {
      return UsersService.getFollowing(params.id);
    },
    {
      params: UserParams,
      response: t.Array(UserWithProfileDto),
    },
  )
  .use(authMiddleware)
  .post(
    "/:id/follow",
    async ({ params, userId }) => {
      return UsersService.followUser(userId, params.id);
    },
    {
      params: UserParams,
      response: FollowActionDto,
    },
  )
  .delete(
    "/:id/follow",
    async ({ params, userId }) => {
      return UsersService.unfollowUser(userId, params.id);
    },
    {
      params: UserParams,
      response: FollowActionDto,
    },
  )
  .get(
    "/me/profile",
    async ({ userId }) => {
      return UsersService.getUserProfileOrThrow(userId, "Profile not found");
    },
    {
      response: UserWithProfileDto,
    },
  )
  .get(
    "/me/admin-status",
    async ({ userId }) => {
      return UsersService.getAdminStatus(userId);
    },
    {
      response: AdminStatusDto,
    },
  )
  .put(
    "/me/profile",
    async ({ body, userId }) => {
      return UsersService.updateUserProfile(userId, body);
    },
    {
      body: UpdateUserProfileBody,
      response: UserProfileDto,
    },
  )
  .get(
    "/me/following",
    async ({ userId }) => {
      return UsersService.getFollowing(userId);
    },
    {
      response: t.Array(UserWithProfileDto),
    },
  )
  .get(
    "/me/check-follow/:id",
    async ({ params, userId }) => {
      const isFollowing = await UsersService.isFollowing(userId, params.id);
      return { isFollowing };
    },
    {
      params: UserParams,
      response: IsFollowingDto,
    },
  );
