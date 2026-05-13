import { relations } from "drizzle-orm";
import {
  pgTable,
  timestamp,
  integer,
  index,
  uuid,
  unique,
  pgEnum,
  text,
} from "drizzle-orm/pg-core";
import { anime } from "../anime/anime.schema";
import { user } from "../auth/auth.schema";

export const libraryStatusEnum = pgEnum("library_status", [
  "watching",
  "completed",
  "watchlist",
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

export type LibraryStatus = (typeof libraryStatusEnum.enumValues)[number];
