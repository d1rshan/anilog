import { Elysia, t } from "elysia";
import { UserService, notFoundError, unauthorizedError } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  adminStatusSchema,
  followActionResultSchema,
  isFollowingResultSchema,
  profileUpdateInputSchema,
  publicUserLibraryEntrySchema,
  userIdParamsSchema,
  userSearchQuerySchema,
  usernameParamsSchema,
  userProfileSchema,
  userWithProfileSchema,
} from "../schemas";

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
      query: userSearchQuerySchema,
      response: t.Array(userWithProfileSchema),
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
      params: userIdParamsSchema,
      response: userWithProfileSchema,
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
      params: usernameParamsSchema,
      response: userWithProfileSchema,
    },
  )
  .get(
    "/:id/library",
    async ({ params }) => {
      return UserService.getPublicUserLibrary(params.id);
    },
    {
      params: userIdParamsSchema,
      response: t.Array(publicUserLibraryEntrySchema),
    },
  )
  .get(
    "/:id/followers",
    async ({ params }) => {
      return UserService.getFollowers(params.id);
    },
    {
      params: userIdParamsSchema,
      response: t.Array(userWithProfileSchema),
    },
  )
  .get(
    "/:id/following",
    async ({ params }) => {
      return UserService.getFollowing(params.id);
    },
    {
      params: userIdParamsSchema,
      response: t.Array(userWithProfileSchema),
    },
  )
  .use(authMiddleware)
  .post(
    "/:id/follow",
    async ({ params, userId }) => {
      return UserService.followUser(userId, params.id);
    },
    {
      params: userIdParamsSchema,
      response: followActionResultSchema,
    },
  )
  .delete(
    "/:id/follow",
    async ({ params, userId }) => {
      return UserService.unfollowUser(userId, params.id);
    },
    {
      params: userIdParamsSchema,
      response: followActionResultSchema,
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
      response: userWithProfileSchema,
    },
  )
  .get(
    "/me/admin-status",
    async ({ userId }) => {
      const isAdmin = await UserService.getAdminStatus(userId);
      return { isAdmin };
    },
    {
      response: adminStatusSchema,
    },
  )
  .put(
    "/me/profile",
    async ({ body, userId }) => {
      return UserService.updateUserProfile(userId, body);
    },
    {
      body: profileUpdateInputSchema,
      response: userProfileSchema,
    },
  )
  .get(
    "/me/following",
    async ({ userId }) => {
      return UserService.getFollowing(userId);
    },
    {
      response: t.Array(userWithProfileSchema),
    },
  )
  .get(
    "/me/check-follow/:id",
    async ({ params, userId }) => {
      const isFollowing = await UserService.isFollowing(userId, params.id);
      return { isFollowing };
    },
    {
      params: userIdParamsSchema,
      response: isFollowingResultSchema,
    },
  );
