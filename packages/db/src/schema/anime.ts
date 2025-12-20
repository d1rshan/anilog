import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, integer, index, uuid, pgEnum } from "drizzle-orm/pg-core";
import { user } from "./auth";

// Enum for list types
export const listTypeEnum = pgEnum("list_type", ["favorites", "watching", "completed", "planned", "dropped", "custom"]);

// User lists table - users can have multiple lists
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

// Anime table - stores anime information (for now with mock data)
export const anime = pgTable(
	"anime",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		title: text("title").notNull(),
		titleJapanese: text("title_japanese"),
		description: text("description"),
		episodes: integer("episodes"),
		status: text("status"), // airing, completed, etc.
		genres: text("genres"), // JSON string for now
		imageUrl: text("image_url"),
		year: integer("year"),
		rating: text("rating"), // PG-13, R, etc.
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

// List entries table - connects anime to user lists with user progress
export const listEntry = pgTable(
	"list_entry",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		listId: uuid("list_id")
			.notNull()
			.references(() => userList.id, { onDelete: "cascade" }),
		animeId: uuid("anime_id")
			.notNull()
			.references(() => anime.id, { onDelete: "cascade" }),
		currentEpisode: integer("current_episode").default(0).notNull(),
		rating: integer("rating"), // 1-10 rating by user
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
		// Ensure unique anime per list
		index("list_entry_unique_idx").on(table.listId, table.animeId),
	],
);

// Relations
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