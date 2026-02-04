import { db } from "@anilog/db";
import { userList, listEntry, anime } from "@anilog/db/schema/anilog";
import { eq, getTableColumns } from "drizzle-orm";
import type {
  UserList,
  ListEntry,
} from "@anilog/db/schema/anilog";

export class ListService {
  static async createDefaultLists(userId: string): Promise<UserList[]> {
    const defaultLists = [
      { userId, name: "Favorites" },
    ];

    return await db.insert(userList).values(defaultLists).returning() as UserList[];
  }

  static async getUserListsWithEntries(userId: string) {
    const lists = await db
      .select({
        ...getTableColumns(userList),
      })
      .from(userList)
      .where(eq(userList.userId, userId));

    return Promise.all(
      lists.map(async (list) => {
        const entries = await db
          .select({
            ...getTableColumns(listEntry),
            anime: {
              id: anime.id,
              title: anime.title,
              titleJapanese: anime.titleJapanese,
              imageUrl: anime.imageUrl,
              year: anime.year,
              episodes: anime.episodes,
            },
          })
          .from(listEntry)
          .innerJoin(anime, eq(listEntry.animeId, anime.id))
          .where(eq(listEntry.listId, list.id));

        return { ...list, entries };
      })
    );
  }

  static async createList(userId: string, name: string): Promise<UserList> {
    const [newList] = await db.insert(userList).values({ userId, name }).returning();
    return newList as UserList;
  }

  static async updateList(listId: string, name: string): Promise<UserList | null> {
    const [updatedList] = await db
      .update(userList)
      .set({ name, updatedAt: new Date() })
      .where(eq(userList.id, listId))
      .returning();

    return (updatedList || null) as UserList | null;
  }

  static async deleteList(listId: string): Promise<boolean> {
    const result = await db.delete(userList).where(eq(userList.id, listId)).returning();
    return result.length > 0;
  }

  static async addAnimeToList(listId: string, animeId: number, currentEpisode?: number, rating?: number): Promise<ListEntry> {
    const existingEntry = await db.query.listEntry.findFirst({
      where: (entry, { and, eq }) => and(
        eq(entry.listId, listId),
        eq(entry.animeId, animeId)
      )
    });

    if (existingEntry) {
      throw new Error("This anime is already in this list");
    }

    const [newEntry] = await db
      .insert(listEntry)
      .values({
        listId,
        animeId,
        currentEpisode: currentEpisode || 0,
        rating,
      })
      .returning();

    return newEntry as ListEntry;
  }

  static async updateListEntry(entryId: string, currentEpisode?: number, rating?: number): Promise<ListEntry | null> {
    const [updatedEntry] = await db
      .update(listEntry)
      .set({ currentEpisode, rating, updatedAt: new Date() })
      .where(eq(listEntry.id, entryId))
      .returning();

    return (updatedEntry || null) as ListEntry | null;
  }

  static async removeAnimeFromList(entryId: string): Promise<boolean> {
    const result = await db.delete(listEntry).where(eq(listEntry.id, entryId)).returning();
    return result.length > 0;
  }

  static async addToFavorites(userId: string, animeId: number): Promise<ListEntry> {
    // Check if Favorites list exists
    let favoritesList = await db.query.userList.findFirst({
      where: (list, { and, eq }) => and(
        eq(list.userId, userId),
        eq(list.name, "Favorites")
      )
    });

    // Create Favorites list if it doesn't exist
    if (!favoritesList) {
      const [newList] = await db.insert(userList).values({
        userId,
        name: "Favorites"
      }).returning();
      favoritesList = newList;
    }

    // Check if anime already in Favorites
    const existingEntry = await db.query.listEntry.findFirst({
      where: (entry, { and, eq }) => and(
        eq(entry.listId, favoritesList!.id),
        eq(entry.animeId, animeId)
      )
    });

    if (existingEntry) {
      throw new Error("Anime already in Favorites");
    }

    // Add anime to Favorites
    const [newEntry] = await db.insert(listEntry).values({
      listId: favoritesList!.id,
      animeId,
      currentEpisode: 0,
    }).returning();

    return newEntry as ListEntry;
  }

  static async removeFromFavorites(userId: string, animeId: number): Promise<boolean> {
    const favoritesList = await db.query.userList.findFirst({
      where: (list, { and, eq }) => and(
        eq(list.userId, userId),
        eq(list.name, "Favorites")
      )
    });

    if (!favoritesList) {
      throw new Error("Favorites list not found");
    }

    const existingEntry = await db.query.listEntry.findFirst({
      where: (entry, { and, eq }) => and(
        eq(entry.listId, favoritesList.id),
        eq(entry.animeId, animeId)
      )
    });

    if (!existingEntry) {
      throw new Error("Anime not in Favorites");
    }

    const result = await db.delete(listEntry).where(eq(listEntry.id, existingEntry.id)).returning();
    return result.length > 0;
  }
}
