import { Elysia } from "elysia";
import { auth } from "@anilog/auth";
import { unauthorizedError } from "../lib/api-error";

export const authPlugin = (app: Elysia) =>
  app.derive(async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      throw unauthorizedError("User not authenticated");
    }

    return {
      session,
      userId,
    };
  });
