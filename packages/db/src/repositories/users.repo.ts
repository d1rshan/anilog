import { db } from "../client";
import { anime, userAnime, userFollow, userProfile } from "../schema/anilog";
import { user } from "../schema/auth";
import { and, asc, count, eq, getTableColumns, ilike, inArray, sql } from "drizzle-orm";

export type UserProfileRecord = typeof userProfile.$inferSelect;

export type UserSummaryRecord = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  isAdmin: boolean;
  image: string | null;
  profile: UserProfileRecord | null;
};

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

function userSummarySelect() {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    image: user.image,
    profile: getTableColumns(userProfile),
  };
}

async function getFollowCountsMap(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, { followerCount: number; followingCount: number }>();
  }

  const [followerRows, followingRows] = await Promise.all([
    db
      .select({
        userId: userFollow.followingId,
        count: sql<number>`count(*)::int`,
      })
      .from(userFollow)
      .where(inArray(userFollow.followingId, userIds))
      .groupBy(userFollow.followingId),
    db
      .select({
        userId: userFollow.followerId,
        count: sql<number>`count(*)::int`,
      })
      .from(userFollow)
      .where(inArray(userFollow.followerId, userIds))
      .groupBy(userFollow.followerId),
  ]);

  const counts = new Map<string, { followerCount: number; followingCount: number }>();

  for (const userId of userIds) {
    counts.set(userId, { followerCount: 0, followingCount: 0 });
  }

  for (const row of followerRows) {
    const current = counts.get(row.userId) ?? { followerCount: 0, followingCount: 0 };
    counts.set(row.userId, { ...current, followerCount: row.count });
  }

  for (const row of followingRows) {
    const current = counts.get(row.userId) ?? { followerCount: 0, followingCount: 0 };
    counts.set(row.userId, { ...current, followingCount: row.count });
  }

  return counts;
}

export class UsersRepository {
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

    const found = rows[0];
    if (!found) {
      return null;
    }

    const counts = await this.getFollowCounts(userId);
    return { ...found, ...counts };
  }

  static async findUserByUsername(username: string): Promise<UserWithCountsRecord | null> {
    const rows = await db
      .select(userSummarySelect())
      .from(user)
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(eq(user.username, username))
      .limit(1);

    const found = rows[0];
    if (!found) {
      return null;
    }

    const counts = await this.getFollowCounts(found.id);
    return { ...found, ...counts };
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

  static async createFollow(followerId: string, followingId: string) {
    await db.insert(userFollow).values({
      followerId,
      followingId,
    });
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

  static async getFollowerCount(userId: string) {
    const rows = await db
      .select({ count: count() })
      .from(userFollow)
      .where(eq(userFollow.followingId, userId));

    return rows[0]?.count || 0;
  }

  static async getFollowingCount(userId: string) {
    const rows = await db
      .select({ count: count() })
      .from(userFollow)
      .where(eq(userFollow.followerId, userId));

    return rows[0]?.count || 0;
  }

  static async getFollowCounts(userId: string) {
    const [followerCount, followingCount] = await Promise.all([
      this.getFollowerCount(userId),
      this.getFollowingCount(userId),
    ]);

    return { followerCount, followingCount };
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
