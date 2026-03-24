import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, index } from "drizzle-orm/pg-core";

export const anime = pgTable(
  "anime",
  {
    id: integer("id").primaryKey(),
    title: text("title").notNull(),
    titleJapanese: text("title_japanese").default("").notNull(),
    episodes: integer("episodes").default(-1).notNull(),
    status: text("status").notNull(),
    genres: text("genres").array().notNull(),
    imageUrl: text("image_url").notNull(),
    year: integer("year").default(2006).notNull(),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("anime_title_idx").on(table.title), index("anime_status_idx").on(table.status)],
);

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

export const animeRelations = relations(anime, ({ many }) => ({
  userAnimeEntries: many(trendingAnime),
}));

export const trendingAnimeRelations = relations(trendingAnime, ({ one }) => ({
  anime: one(anime, {
    fields: [trendingAnime.animeId],
    references: [anime.id],
  }),
}));

export type Anime = typeof anime.$inferSelect;
