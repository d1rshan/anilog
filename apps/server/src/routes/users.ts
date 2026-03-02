import { Elysia, t } from "elysia";
import { UserService, notFoundError, unauthorizedError } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  AdminStatusDto,
  FollowActionDto,
  IsFollowingDto,
  UpdateUserProfileBody,
  PublicLibraryEntryDto,
  UserParams,
  UserSearchQuery,
  UsernameParams,
  UserProfileDto,
  UserWithProfileDto,
} from "@anilog/api";

const authMiddleware = (app: Elysia) =>
  app.derive(async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      throw unauthorizedError("User not authenticated");
    }
    return { userId: session.user.id };
  });

export const userRoutes = new Elysia({ prefix: "/users" })
  .get(
    "/search",
    async ({ query }) => {
      return UserService.searchUsers(query.q || "", 20);
    },
    {
      query: UserSearchQuery,
      response: t.Array(UserWithProfileDto),
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const foundUser = await UserService.getUserProfile(params.id);
      if (!foundUser) {
        throw notFoundError("User not found");
      }
      return foundUser;
    },
    {
      params: UserParams,
      response: UserWithProfileDto,
    },
  )
  .get(
    "/username/:username",
    async ({ params }) => {
      const foundUser = await UserService.getUserByUsername(params.username);
      if (!foundUser) {
        throw notFoundError("User not found");
      }
      return foundUser;
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
  .use(authMiddleware)
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
      const profile = await UserService.getUserProfile(userId);
      if (!profile) {
        throw notFoundError("Profile not found");
      }
      return profile;
    },
    {
      response: UserWithProfileDto,
    },
  )
  .get(
    "/me/admin-status",
    async ({ userId }) => {
      const isAdmin = await UserService.getAdminStatus(userId);
      return { isAdmin };
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
