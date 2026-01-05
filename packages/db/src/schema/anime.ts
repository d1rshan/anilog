import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, index, uuid, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const listTypeEnum = pgEnum("list_type", ["favorites", "watching", "completed", "planned", "dropped", "custom"]);

export const userList = pgTable(
  "user_list",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: listTypeEnum("type").notNull().default("custom"),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("user_list_userId_idx").on(table.userId),
    index("user_list_type_idx").on(table.type),
  ],
);

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
    imageUrl: text("image_url"),
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
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("list_entry_listId_idx").on(table.listId),
    index("list_entry_animeId_idx").on(table.animeId),
    index("list_entry_unique_idx").on(table.listId, table.animeId),
  ],
);

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
