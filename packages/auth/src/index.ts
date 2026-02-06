import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@anilog/db";
import * as schema from "@anilog/db/schema/auth";
import { UserService } from "@anilog/api";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
		schema: schema,
	}),
	basePath: "/auth",
	trustedOrigins: [process.env.CORS_ORIGIN || ""],
	emailAndPassword: {
		enabled: true,
	},
	usernameAndPassword: {
		enabled: true,
		minUsernameLength: 3,
		maxUsernameLength: 20,
	},
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
