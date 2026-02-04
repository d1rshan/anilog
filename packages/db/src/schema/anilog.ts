import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, index, uuid, unique } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const userList = pgTable(
  "user_list",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_list_userId_idx").on(table.userId),
  ],
);

export type UserList = typeof userList.$inferSelect;
export type NewUserList = typeof userList.$inferInsert;

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
    year: integer("year"),
    rating: integer("rating"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("anime_title_idx").on(table.title),
    index("anime_status_idx").on(table.status),
  ],
);

export type Anime = typeof anime.$inferSelect;
export type NewAnime = typeof anime.$inferInsert;

export const listEntry = pgTable(
  "list_entry",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    listId: uuid("list_id")
      .notNull()
      .references(() => userList.id, { onDelete: "cascade" }),
    animeId: integer("anime_id")
      .notNull()
      .references(() => anime.id, { onDelete: "cascade" }),
    currentEpisode: integer("current_episode").default(0).notNull(),
    rating: integer("rating"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("list_entry_listId_idx").on(table.listId),
    index("list_entry_animeId_idx").on(table.animeId),
    unique("list_entry_unique_listId_animeId")
      .on(table.listId, table.animeId),
  ],
);

export type ListEntry = typeof listEntry.$inferSelect;
export type NewListEntry = typeof listEntry.$inferInsert;

export const trendingAnime = pgTable(
  "trending_anime",
  {
    animeId: integer("anime_id").references(() => anime.id, { onDelete: "cascade" })
      .notNull().primaryKey(),
    rank: integer("rank")
      .notNull(),
    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("trending_rank_idx").on(table.rank),
  ]
);

export const trendingAnimeRelations = relations(trendingAnime, ({ one }) => ({
  anime: one(anime, {
    fields: [trendingAnime.animeId],
    references: [anime.id],
  }),
}));

export const userListRelations = relations(userList, ({ one, many }) => ({
  user: one(user, {
    fields: [userList.userId],
    references: [user.id],
  }),
  entries: many(listEntry),
}));

export const animeRelations = relations(anime, ({ many }) => ({
  listEntries: many(listEntry),
}));

export const listEntryRelations = relations(listEntry, ({ one }) => ({
  list: one(userList, {
    fields: [listEntry.listId],
    references: [userList.id],
  }),
  anime: one(anime, {
    fields: [listEntry.animeId],
    references: [anime.id],
  }),
}));
