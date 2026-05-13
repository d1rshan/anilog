import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { UsersQueries, db } from "@anilog/db";
import { getCorsOrigins, serverEnv } from "@anilog/env/server";
import * as schema from "@anilog/db/schema";

const trustedOrigins = getCorsOrigins();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  basePath: "/auth",
  secret: serverEnv.BETTER_AUTH_SECRET,
  baseURL: serverEnv.BETTER_AUTH_URL,
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
            await UsersQueries.createUserProfile(user.id);
            console.log(`[Auth] Created profile for user: ${user.id}`);
          } catch (error) {
            console.error(`[Auth] Failed to create profile for user: ${user.id}`, error);
          }
        },
      },
    },
  },
});
