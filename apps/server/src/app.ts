import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "@anilog/auth";
import { getCorsOrigins } from "@anilog/env/server";
import { adminRoutes } from "./features/admin/admin.route";
import { animeRoutes } from "./features/anime/anime.route";
import { libraryRoutes } from "./features/library/library.route";
import { usersRoutes } from "./features/users/users.route";
import { errorMiddleware } from "./middleware/error.middleware";

const allowedOrigins = getCorsOrigins();

export const app = new Elysia()
  .use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
      credentials: true,
    }),
  )
  .use(errorMiddleware)
  .all("/auth/*", async ({ request, status }) => {
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }

    return status(405);
  })
  .group("/api", (api) => api.use(animeRoutes).use(libraryRoutes).use(usersRoutes).use(adminRoutes))
  .get("/", () => "OK");

export type App = typeof app;
