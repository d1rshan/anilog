import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "@anilog/auth";
import { adminRoutes } from "./routes/admin.route";
import { animeRoutes } from "./routes/anime.route";
import { libraryRoutes } from "./routes/library.route";
import { userRoutes } from "./routes/users.route";
import { errorPlugin } from "./plugins/error.plugin";

const allowedOrigins = process.env.CORS_ORIGIN || "http://localhost:3001";

export const app = new Elysia()
  .use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
      credentials: true,
    }),
  )
  .use(errorPlugin)
  .all("/auth/*", async ({ request, status }) => {
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }

    return status(405);
  })
  .group("/api", (api) => api.use(animeRoutes).use(libraryRoutes).use(userRoutes).use(adminRoutes))
  .get("/", () => "OK");

export type App = typeof app;
