import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  serial,
  index,
  uuid,
  unique,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

export const anime = pgTable(
  "anime",
  {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    titleJapanese: text("title_japanese"),
    description: text("description"),
    episodes: integer("episodes"),
    status: text("status"),
    genres: text("genres").array(),
    imageUrl: text("image_url").notNull(),
    bannerImage: text("banner_image"),
    year: integer("year"),
    rating: integer("rating"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("anime_title_idx").on(table.title), index("anime_status_idx").on(table.status)],
);

export type Anime = typeof anime.$inferSelect;
export type NewAnime = typeof anime.$inferInsert;

export const libraryStatusEnum = pgEnum("library_status", [
  "watching",
  "completed",
  "planned",
  "dropped",
]);

export const userAnime = pgTable(
  "user_anime",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    animeId: integer("anime_id")
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    status: libraryStatusEnum("status").notNull(),
    currentEpisode: integer("current_episode").default(0).notNull(),
    rating: integer("rating"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_anime_userId_idx").on(table.userId),
    index("user_anime_animeId_idx").on(table.animeId),
    index("user_anime_status_idx").on(table.status),
    unique("user_anime_unique_userId_animeId").on(table.userId, table.animeId),
  ],
);

export type UserAnime = typeof userAnime.$inferSelect;
export type NewUserAnime = typeof userAnime.$inferInsert;
export type LibraryStatus = (typeof libraryStatusEnum.enumValues)[number];

export const trendingAnime = pgTable(
  "trending_anime",
  {
    animeId: integer("anime_id")
      .references(() => anime.id, { onDelete: "cascade" })
      .notNull()
      .primaryKey(),
    rank: integer("rank").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("trending_rank_idx").on(table.rank)],
);

export const trendingAnimeRelations = relations(trendingAnime, ({ one }) => ({
  anime: one(anime, {
    fields: [trendingAnime.animeId],
    references: [anime.id],
  }),
}));

export const heroCuration = pgTable(
  "hero_curation",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull().unique(),
    videoId: text("video_id").notNull(),
    start: integer("start").notNull().default(0),
    stop: integer("stop").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle").notNull(),
    description: text("description").notNull(),
    tag: text("tag").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("hero_curation_sortOrder_idx").on(table.sortOrder),
    index("hero_curation_isActive_idx").on(table.isActive),
  ],
);

export type HeroCuration = typeof heroCuration.$inferSelect;
export type NewHeroCuration = typeof heroCuration.$inferInsert;

export const animeRelations = relations(anime, ({ many }) => ({
  userAnimeEntries: many(userAnime),
}));

export const userAnimeRelations = relations(userAnime, ({ one }) => ({
  user: one(user, {
    fields: [userAnime.userId],
    references: [user.id],
  }),
  anime: one(anime, {
    fields: [userAnime.animeId],
    references: [anime.id],
  }),
}));

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

export type UserFollow = typeof userFollow.$inferSelect;
export type NewUserFollow = typeof userFollow.$inferInsert;

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

export type UserProfile = typeof userProfile.$inferSelect;
export type NewUserProfile = typeof userProfile.$inferInsert;

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
