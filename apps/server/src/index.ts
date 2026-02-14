import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { auth } from "@anilog/auth";
import { animeRoutes } from "./routes/anime";
import { userRoutes } from "./routes/users";
import { libraryRoutes } from "./routes/library";

const app = new Elysia()
  .use(
    cors({
      origin: process.env.CORS_ORIGIN || "",
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
  .group("/api", (app) => app.use(animeRoutes).use(libraryRoutes).use(userRoutes))
  .get("/", () => "OK")
  .listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
  });

export type App = typeof app;
