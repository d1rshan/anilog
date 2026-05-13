import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, index, uuid, unique, boolean } from "drizzle-orm/pg-core";
import { user } from "../auth/auth.schema";

export const userFollow = pgTable(
  "user_follow",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: text("follower_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    followingId: text("following_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("user_follow_followerId_idx").on(table.followerId),
    index("user_follow_followingId_idx").on(table.followingId),
    unique("user_follow_unique_follower_following").on(table.followerId, table.followingId),
  ],
);

export const userProfile = pgTable(
  "user_profile",
  {
    userId: text("user_id")
      .primaryKey()
      .references(() => user.id, { onDelete: "cascade" }),
    bio: text("bio"),
    displayName: text("display_name"),
    website: text("website"),
    location: text("location"),
    twitterUrl: text("twitter_url"),
    discordUrl: text("discord_url"),
    githubUrl: text("github_url"),
    instagramUrl: text("instagram_url"),
    isPublic: boolean("is_public").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("user_profile_userId_idx").on(table.userId)],
);

export const userFollowRelations = relations(userFollow, ({ one }) => ({
  follower: one(user, {
    fields: [userFollow.followerId],
    references: [user.id],
  }),
  following: one(user, {
    fields: [userFollow.followingId],
    references: [user.id],
  }),
}));

export const userProfileRelations = relations(userProfile, ({ one }) => ({
  user: one(user, {
    fields: [userProfile.userId],
    references: [user.id],
  }),
}));
