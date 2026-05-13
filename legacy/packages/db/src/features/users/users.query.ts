import { db } from "../../client";
import { anime } from "../anime/anime.schema";
import { userAnime } from "../library/library.schema";
import { user } from "../auth/auth.schema";
import { and, asc, eq, getTableColumns, ilike } from "drizzle-orm";
import { userFollow, userProfile } from "./users.schema";
import { getFollowCountsMap } from "./users.helpers";
import { userSummarySelect, type UserProfileRecord, type UserSummaryRecord } from "./users.helpers";

export type UserWithCountsRecord = UserSummaryRecord & {
  followerCount: number;
  followingCount: number;
};

export type PublicLibraryEntryRecord = {
  id: string;
  animeId: number;
  status: (typeof userAnime.$inferSelect)["status"];
  currentEpisode: number;
  rating: number | null;
  createdAt: Date;
  anime: {
    id: number;
    title: string;
    titleJapanese: string;
    imageUrl: string;
    year: number;
    episodes: number;
    status: string;
    genres: string[];
    rating: number;
  };
};

export class UsersQueries {
  static async createUserProfile(userId: string): Promise<UserProfileRecord | null> {
    const [profile] = await db
      .insert(userProfile)
      .values({
        userId,
        isPublic: true,
      })
      .onConflictDoNothing()
      .returning();

    return profile ?? null;
  }

  static async findUserProfileRecord(userId: string): Promise<UserProfileRecord | null> {
    const profile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, userId),
    });

    return profile ?? null;
  }

  static async findUserById(userId: string): Promise<UserWithCountsRecord | null> {
    const rows = await db
      .select(userSummarySelect())
      .from(user)
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(eq(user.id, userId))
      .limit(1);

    const [found] = await this.attachCounts(rows);

    if (!found) {
      return null;
    }

    return found;
  }

  static async findUserByUsername(username: string): Promise<UserWithCountsRecord | null> {
    const rows = await db
      .select(userSummarySelect())
      .from(user)
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(eq(user.username, username))
      .limit(1);

    const [found] = await this.attachCounts(rows);

    if (!found) {
      return null;
    }

    return found;
  }

  static async updateUserProfile(userId: string, data: Partial<UserProfileRecord>) {
    const [updatedProfile] = await db
      .update(userProfile)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, userId))
      .returning();

    return updatedProfile ?? null;
  }

  static async findUserExists(userId: string) {
    const found = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { id: true },
    });

    return Boolean(found);
  }

  static async createFollow(followerId: string, followingId: string): Promise<boolean> {
    const [createdFollow] = await db
      .insert(userFollow)
      .values({
        followerId,
        followingId,
      })
      .onConflictDoNothing()
      .returning({ id: userFollow.id });

    return Boolean(createdFollow);
  }

  static async deleteFollow(followerId: string, followingId: string) {
    return db
      .delete(userFollow)
      .where(and(eq(userFollow.followerId, followerId), eq(userFollow.followingId, followingId)))
      .returning();
  }

  static async findFollow(followerId: string, followingId: string) {
    const rows = await db
      .select({ followerId: userFollow.followerId })
      .from(userFollow)
      .where(and(eq(userFollow.followerId, followerId), eq(userFollow.followingId, followingId)))
      .limit(1);

    return rows[0] ?? null;
  }

  static async findFollowers(userId: string): Promise<UserWithCountsRecord[]> {
    const rows = await db
      .select(userSummarySelect())
      .from(userFollow)
      .innerJoin(user, eq(userFollow.followerId, user.id))
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(eq(userFollow.followingId, userId));

    return this.attachCounts(rows);
  }

  static async findFollowing(userId: string): Promise<UserWithCountsRecord[]> {
    const rows = await db
      .select(userSummarySelect())
      .from(userFollow)
      .innerJoin(user, eq(userFollow.followingId, user.id))
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(eq(userFollow.followerId, userId));

    return this.attachCounts(rows);
  }

  static async getFollowCounts(userId: string) {
    const counts = await getFollowCountsMap([userId]);
    return counts.get(userId) ?? { followerCount: 0, followingCount: 0 };
  }

  static async findPublicLibrary(userId: string): Promise<PublicLibraryEntryRecord[]> {
    const library = await db
      .select({
        ...getTableColumns(userAnime),
        anime: {
          id: anime.id,
          title: anime.title,
          titleJapanese: anime.titleJapanese,
          imageUrl: anime.imageUrl,
          year: anime.year,
          episodes: anime.episodes,
          status: anime.status,
          genres: anime.genres,
          rating: anime.rating,
        },
      })
      .from(userAnime)
      .innerJoin(anime, eq(userAnime.animeId, anime.id))
      .where(eq(userAnime.userId, userId))
      .orderBy(asc(userAnime.createdAt));

    return library.map((entry) => ({
      id: entry.id,
      animeId: entry.animeId,
      status: entry.status,
      currentEpisode: entry.currentEpisode,
      rating: entry.rating,
      createdAt: entry.createdAt,
      anime: entry.anime,
    }));
  }

  static async searchUsers(query: string, limit: number): Promise<UserWithCountsRecord[]> {
    const searchPattern = `%${query}%`;

    const rows = await db
      .select(userSummarySelect())
      .from(user)
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(and(ilike(user.name, searchPattern), eq(userProfile.isPublic, true)))
      .limit(limit);

    return this.attachCounts(rows);
  }

  static async findAdminStatus(userId: string) {
    const found = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { isAdmin: true },
    });

    return { isAdmin: found?.isAdmin ?? false };
  }

  private static async attachCounts(rows: UserSummaryRecord[]): Promise<UserWithCountsRecord[]> {
    const counts = await getFollowCountsMap(rows.map((row) => row.id));

    return rows.map((row) => {
      const userCounts = counts.get(row.id) ?? { followerCount: 0, followingCount: 0 };
      return {
        ...row,
        ...userCounts,
      };
    });
  }
}
