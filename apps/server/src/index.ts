import "dotenv/config";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { isApiError } from "@anilog/api";
import { auth } from "@anilog/auth";
import { animeRoutes } from "./routes/anime";
import { userRoutes } from "./routes/users";
import { libraryRoutes } from "./routes/library";
import { adminRoutes } from "./routes/admin";

const allowedOrigins = process.env.CORS_ORIGIN || "http://localhost:3001";

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
  .onError(({ code, error, set }) => {
    if (isApiError(error)) {
      set.status = error.status;
      return { error: error.message };
    }

    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Invalid request payload" };
    }

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Route not found" };
    }

    console.error("Unhandled server error:", error);
    set.status = 500;
    return { error: "Internal server error" };
  })
  .group("/api", (app) => app.use(animeRoutes).use(libraryRoutes).use(userRoutes).use(adminRoutes))
  .get("/", () => "OK")
  .listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });

export type App = typeof app;
