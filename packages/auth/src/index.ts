import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { db } from "@anilog/db";
import * as schema from "@anilog/db/schema/auth";
import { UserService } from "@anilog/api";

const trustedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  basePath: "/auth",
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    username({
      minUsernameLength: 3,
      maxUsernameLength: 20,
    }),
  ],
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true,
      httpOnly: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            await UserService.createUserProfile(user.id);
            console.log(`[Auth] Created profile for user: ${user.id}`);
          } catch (error) {
            console.error(`[Auth] Failed to create profile for user: ${user.id}`, error);
          }
        },
      },
    },
  },
});
