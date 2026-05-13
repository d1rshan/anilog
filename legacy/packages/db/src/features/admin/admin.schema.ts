import { pgTable, text, timestamp, integer, serial, index, boolean } from "drizzle-orm/pg-core";

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
