import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "@anilog/auth";
import { animeRoutes } from "./routes/anime";
import { userRoutes } from "./routes/users";
import { libraryRoutes } from "./routes/library";
import { adminRoutes } from "./routes/admin";

const allowedOrigins = process.env.CORS_ORIGIN || "http://localhost:3001"

const port = Number(process.env.PORT || 3000);

const app = new Elysia()
  .use(
    cors({
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
      credentials: true,
    }),
  )
  .all("/auth/*", async (context) => {
    const { request, status } = context;
    if (["POST", "GET"].includes(request.method)) {
      return auth.handler(request);
    }
    return status(405);
  })
  .group("/api", (app) => app.use(animeRoutes).use(libraryRoutes).use(userRoutes).use(adminRoutes))
  .get("/", () => "OK")
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

export type App = typeof app;
