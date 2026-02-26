import { Elysia, t } from "elysia";
import { UserService } from "@anilog/api";
import { auth } from "@anilog/auth";
import {
  adminStatusSchema,
  errorResponseSchema,
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
      throw new Error("User not authenticated");
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
      response: {
        200: t.Array(userWithProfileSchema),
      },
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const foundUser = await UserService.getUserProfile(params.id);
      if (!foundUser) {
        throw new Error("User not found");
      }
      return foundUser;
    },
    {
      params: userIdParamsSchema,
      response: {
        200: userWithProfileSchema,
      },
    },
  )
  .get(
    "/username/:username",
    async ({ params }) => {
      const foundUser = await UserService.getUserByUsername(params.username);
      if (!foundUser) {
        throw new Error("User not found");
      }
      return foundUser;
    },
    {
      params: usernameParamsSchema,
      response: {
        200: userWithProfileSchema,
      },
    },
  )
  .get(
    "/:id/library",
    async ({ params }) => {
      return UserService.getPublicUserLibrary(params.id);
    },
    {
      params: userIdParamsSchema,
      response: {
        200: t.Array(publicUserLibraryEntrySchema),
      },
    },
  )
  .get(
    "/:id/followers",
    async ({ params }) => {
      return UserService.getFollowers(params.id);
    },
    {
      params: userIdParamsSchema,
      response: {
        200: t.Array(userWithProfileSchema),
      },
    },
  )
  .get(
    "/:id/following",
    async ({ params }) => {
      return UserService.getFollowing(params.id);
    },
    {
      params: userIdParamsSchema,
      response: {
        200: t.Array(userWithProfileSchema),
      },
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
      response: {
        200: followActionResultSchema,
      },
    },
  )
  .delete(
    "/:id/follow",
    async ({ params, userId }) => {
      return UserService.unfollowUser(userId, params.id);
    },
    {
      params: userIdParamsSchema,
      response: {
        200: followActionResultSchema,
      },
    },
  )
  .get(
    "/me/profile",
    async ({ userId }) => {
      const profile = await UserService.getUserProfile(userId);
      if (!profile) {
        throw new Error("Profile not found");
      }
      return profile;
    },
    {
      response: {
        200: userWithProfileSchema,
      },
    },
  )
  .get(
    "/me/admin-status",
    async ({ userId }) => {
      const isAdmin = await UserService.getAdminStatus(userId);
      return { isAdmin };
    },
    {
      response: {
        200: adminStatusSchema,
      },
    },
  )
  .put(
    "/me/profile",
    async ({ body, userId }) => {
      return UserService.updateUserProfile(userId, body);
    },
    {
      body: profileUpdateInputSchema,
      response: {
        200: userProfileSchema,
        400: errorResponseSchema,
      },
    },
  )
  .get(
    "/me/following",
    async ({ userId }) => {
      return UserService.getFollowing(userId);
    },
    {
      response: {
        200: t.Array(userWithProfileSchema),
      },
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
      response: {
        200: isFollowingResultSchema,
      },
    },
  );
