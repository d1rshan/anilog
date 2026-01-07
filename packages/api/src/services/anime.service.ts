import { db } from "@anilog/db";
import { anime } from "@anilog/db/schema/anime";

export class AnimeService {
  // Seed database with mock data if empty
  // static async seedDatabase(): Promise<void> {
  //   try {
  //     const existingAnime = await db.select().from(anime).limit(1);
  //     if (existingAnime.length === 0) {
  //       await db.insert(anime).values(mockAnimeData);
  //       console.log("Database seeded with mock anime data");
  //     }
  //   } catch (error) {
  //     console.error("Error seeding database:", error);
  //   }
  // }
  //
  // // Get all anime
  static async getAllAnime() {
    try {
      return await db.select().from(anime);
    } catch (error) {
      console.error("Error getting all anime:", error);
      throw new Error("Failed to fetch anime");
    }
  }
  //
  // // Get anime by ID
  // static async getAnimeById(id: string): Promise<Anime | null> {
  //   try {
  //     const result = await db
  //       .select()
  //       .from(anime)
  //       .where(eq(anime.id, id))
  //       .limit(1);
  //
  //     return result[0] || null;
  //   } catch (error) {
  //     console.error("Error getting anime by ID:", error);
  //     throw new Error("Failed to fetch anime");
  //   }
  // }
  //
  // Search anime by title
  static async searchAnime(query: string) {
    try {
      const allAnime = await this.getAllAnime();
      return allAnime.filter(anime =>
        anime.title.toLowerCase().includes(query.toLowerCase()) ||
        anime.titleJapanese?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching anime:", error);
      throw new Error("Failed to search anime");
    }
  }
}
