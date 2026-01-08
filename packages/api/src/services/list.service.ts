import { db } from "@anilog/db";
import { userList, listEntry, anime } from "@anilog/db/schema/anime";
import { eq, and } from "drizzle-orm";
import type { 
	UserList, 
	ListEntry, 
	UserListWithEntries, 
	CreateListRequest, 
	UpdateListRequest, 
	AddToListRequest, 
	UpdateListEntryRequest,
	ListEntryWithAnime 
} from "../types";

export class ListService {
	// Create default lists for a new user
	static async createDefaultLists(userId: string): Promise<UserList[]> {
		try {
			const defaultLists = [
				{ userId, name: "Favorites", type: "favorites" as const },
				{ userId, name: "Currently Watching", type: "watching" as const },
				{ userId, name: "Completed", type: "completed" as const },
				{ userId, name: "Plan to Watch", type: "planned" as const },
				{ userId, name: "Dropped", type: "dropped" as const },
			];

			return await db.insert(userList).values(defaultLists).returning() as UserList[];
		} catch (error) {
			console.error("Error creating default lists:", error);
			throw new Error("Failed to create default lists");
		}
	}

	// Get user's lists
	static async getUserLists(userId: string): Promise<UserList[]> {
		try {
			return await db
				.select()
				.from(userList)
				.where(eq(userList.userId, userId)) as UserList[];
		} catch (error) {
			console.error("Error getting user lists:", error);
			throw new Error("Failed to fetch user lists");
		}
	}

	// Get user's lists with entries
	static async getUserListsWithEntries(userId: string): Promise<UserListWithEntries[]> {
		try {
			const lists = await this.getUserLists(userId);
			
			const listsWithEntries = await Promise.all(
				lists.map(async (list) => {
					const entries = await db
						.select({
							id: listEntry.id,
							listId: listEntry.listId,
							animeId: listEntry.animeId,
							currentEpisode: listEntry.currentEpisode,
							rating: listEntry.rating,
							notes: listEntry.notes,
							createdAt: listEntry.createdAt,
							updatedAt: listEntry.updatedAt,
							anime: {
								id: anime.id,
								title: anime.title,
								titleJapanese: anime.titleJapanese,
								description: anime.description,
								episodes: anime.episodes,
								status: anime.status,
								genres: anime.genres,
								imageUrl: anime.imageUrl,
								year: anime.year,
								rating: anime.rating,
								createdAt: anime.createdAt,
								updatedAt: anime.updatedAt,
							}
						})
						.from(listEntry)
						.innerJoin(anime, eq(listEntry.animeId, anime.id))
						.where(eq(listEntry.listId, list.id));

					return {
						...list,
						entries: entries as unknown as ListEntryWithAnime[]
					};
				})
			);

			return listsWithEntries;
		} catch (error) {
			console.error("Error getting user lists with entries:", error);
			throw new Error("Failed to fetch user lists with entries");
		}
	}

	// Create a new list
	static async createList(userId: string, listData: CreateListRequest): Promise<UserList> {
		try {
			const [newList] = await db
				.insert(userList)
				.values({
					userId,
					name: listData.name,
					type: listData.type || "custom",
					description: listData.description,
				})
				.returning();

			return newList as UserList;
		} catch (error) {
			console.error("Error creating list:", error);
			throw new Error("Failed to create list");
		}
	}

	// Update a list
	static async updateList(listId: string, userId: string, updateData: UpdateListRequest): Promise<UserList | null> {
		try {
			const [updatedList] = await db
				.update(userList)
				.set({
					name: updateData.name,
					description: updateData.description,
					updatedAt: new Date(),
				})
				.where(and(eq(userList.id, listId), eq(userList.userId, userId)))
				.returning();

			return (updatedList || null) as UserList | null;
		} catch (error) {
			console.error("Error updating list:", error);
			throw new Error("Failed to update list");
		}
	}

	// Delete a list
	static async deleteList(listId: string, userId: string): Promise<boolean> {
		try {
			const result = await db
				.delete(userList)
				.where(and(eq(userList.id, listId), eq(userList.userId, userId)))
				.returning();

			return result.length > 0;
		} catch (error) {
			console.error("Error deleting list:", error);
			throw new Error("Failed to delete list");
		}
	}

	// Add anime to list
	static async addAnimeToList(listId: string, userId: string, entryData: AddToListRequest): Promise<ListEntry> {
		try {
			// First check if the list belongs to the user
			const list = await db
				.select()
				.from(userList)
				.where(and(eq(userList.id, listId), eq(userList.userId, userId)))
				.limit(1);

			if (!list.length) {
				throw new Error("List not found or access denied");
			}

			// Check if anime is already in the list
			const existingEntry = await db
				.select()
				.from(listEntry)
				.where(and(eq(listEntry.listId, listId), eq(listEntry.animeId, Number(entryData.animeId))))
				.limit(1);

			if (existingEntry.length) {
				throw new Error("Anime is already in this list");
			}

			const [newEntry] = await db
				.insert(listEntry)
				.values({
					listId,
					animeId: Number(entryData.animeId),
					currentEpisode: entryData.currentEpisode || 0,
					rating: entryData.rating,
					notes: entryData.notes,
				})
				.returning();

			return newEntry as ListEntry;
		} catch (error) {
			console.error("Error adding anime to list:", error);
			throw new Error(error instanceof Error ? error.message : "Failed to add anime to list");
		}
	}

	// Update list entry
	static async updateListEntry(entryId: string, userId: string, updateData: UpdateListEntryRequest): Promise<ListEntry | null> {
		try {
			// First verify the entry belongs to the user's list
			const entryWithList = await db
				.select()
				.from(listEntry)
				.innerJoin(userList, eq(listEntry.listId, userList.id))
				.where(and(eq(listEntry.id, entryId), eq(userList.userId, userId)))
				.limit(1);

			if (!entryWithList.length) {
				throw new Error("Entry not found or access denied");
			}

			const [updatedEntry] = await db
				.update(listEntry)
				.set({
					currentEpisode: updateData.currentEpisode,
					rating: updateData.rating,
					notes: updateData.notes,
					updatedAt: new Date(),
				})
				.where(eq(listEntry.id, entryId))
				.returning();

			return (updatedEntry || null) as ListEntry | null;
		} catch (error) {
			console.error("Error updating list entry:", error);
			throw new Error(error instanceof Error ? error.message : "Failed to update list entry");
		}
	}

	// Remove anime from list
	static async removeAnimeFromList(entryId: string, userId: string): Promise<boolean> {
		try {
			// First verify the entry belongs to the user's list
			const entryWithList = await db
				.select()
				.from(listEntry)
				.innerJoin(userList, eq(listEntry.listId, userList.id))
				.where(and(eq(listEntry.id, entryId), eq(userList.userId, userId)))
				.limit(1);

			if (!entryWithList.length) {
				throw new Error("Entry not found or access denied");
			}

			const result = await db
				.delete(listEntry)
				.where(eq(listEntry.id, entryId))
				.returning();

			return result.length > 0;
		} catch (error) {
			console.error("Error removing anime from list:", error);
			throw new Error(error instanceof Error ? error.message : "Failed to remove anime from list");
		}
	}
}