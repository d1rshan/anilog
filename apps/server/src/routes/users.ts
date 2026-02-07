import { Elysia, t } from "elysia";
import { UserService } from "@anilog/api";
import { auth } from "@anilog/auth";

const authMiddleware = (app: Elysia) =>
  app.derive(async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      throw new Error("User not authenticated");
    }
    return { userId: session.user.id };
  });

export const userRoutes = new Elysia({ prefix: "/users" })
  // Public routes
  .get(
    "/search",
    async ({ query }) => {
      const users = await UserService.searchUsers(query.q || "", 20);
      return users;
    },
    {
      query: t.Object({
        q: t.String(),
      }),
    }
  )
  .get(
    "/:id",
    async ({ params }) => {
      const user = await UserService.getUserProfile(params.id);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .get(
    "/username/:username",
    async ({ params }) => {
      const user = await UserService.getUserByUsername(params.username);
      if (!user) {
        throw new Error("User not found");
      }
      return user;
    },
    {
      params: t.Object({
        username: t.String(),
      }),
    }
  )
  .get(
    "/:id/lists",
    async ({ params }) => {
      const lists = await UserService.getPublicUserLists(params.id);
      return lists;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .get(
    "/:id/followers",
    async ({ params }) => {
      const followers = await UserService.getFollowers(params.id);
      return followers;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .get(
    "/:id/following",
    async ({ params }) => {
      const following = await UserService.getFollowing(params.id);
      return following;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  // Authenticated routes
  .use(authMiddleware)
  .post(
    "/:id/follow",
    async ({ params, userId }) => {
      const result = await UserService.followUser(userId, params.id);
      return result;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .delete(
    "/:id/follow",
    async ({ params, userId }) => {
      const result = await UserService.unfollowUser(userId, params.id);
      return result;
    },
    {
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .get("/me/profile", async ({ userId }) => {
    const profile = await UserService.getUserProfile(userId);
    if (!profile) {
      throw new Error("Profile not found");
    }
    return profile;
  })
  .put(
    "/me/profile",
    async ({ body, userId }) => {
      const profile = await UserService.updateUserProfile(userId, body);
      return profile;
    },
    {
      body: t.Object({
        bio: t.Optional(t.Nullable(t.String())),
        displayName: t.Optional(t.Nullable(t.String())),
        website: t.Optional(t.Nullable(t.String())),
        location: t.Optional(t.Nullable(t.String())),
        twitterUrl: t.Optional(t.Nullable(t.String())),
        discordUrl: t.Optional(t.Nullable(t.String())),
        githubUrl: t.Optional(t.Nullable(t.String())),
        instagramUrl: t.Optional(t.Nullable(t.String())),
        isPublic: t.Optional(t.Boolean()),
      }),
    }
  )
  .get("/me/following", async ({ userId }) => {
    const following = await UserService.getFollowing(userId);
    return following;
  })
  .get("/me/check-follow/:id", async ({ params, userId }) => {
    const isFollowing = await UserService.isFollowing(userId, params.id);
    return { isFollowing };
  });
