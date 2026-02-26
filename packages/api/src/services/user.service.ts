import { db } from "@anilog/db";
import { userFollow, userProfile, userAnime, anime } from "@anilog/db/schema/anilog";
import { user } from "@anilog/db/schema/auth";
import { eq, getTableColumns, count, and, ilike, asc, or } from "drizzle-orm";

export class UserService {
  static async createUserProfile(userId: string) {
    const [profile] = await db
      .insert(userProfile)
      .values({
        userId,
        isPublic: true,
      })
      .onConflictDoNothing()
      .returning();

    if (profile) {
      return profile;
    }

    const existingProfile = await db.query.userProfile.findFirst({
      where: eq(userProfile.userId, userId),
    });

    if (!existingProfile) {
      throw new Error("Failed to create or find user profile");
    }

    return existingProfile;
  }

  static async getUserProfile(userId: string) {
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        image: user.image,
        profile: getTableColumns(userProfile),
      })
      .from(user)
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(eq(user.id, userId))
      .limit(1);

    const userData = result[0];
    if (!userData) {
      return null;
    }

    const followerCount = await this.getFollowerCount(userId);
    const followingCount = await this.getFollowingCount(userId);

    return {
      id: userData.id,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      isAdmin: userData.isAdmin,
      image: userData.image,
      profile: userData.profile,
      followerCount,
      followingCount,
    };
  }

  static async getUserByUsername(username: string) {
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        image: user.image,
        profile: getTableColumns(userProfile),
      })
      .from(user)
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(eq(user.username, username))
      .limit(1);

    const userData = result[0];
    if (!userData) {
      return null;
    }

    const followerCount = await this.getFollowerCount(userData.id);
    const followingCount = await this.getFollowingCount(userData.id);

    return {
      id: userData.id,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      isAdmin: userData.isAdmin,
      image: userData.image,
      profile: userData.profile,
      followerCount,
      followingCount,
    };
  }

  static async updateUserProfile(
    userId: string,
    data: {
      bio?: string | null;
      displayName?: string | null;
      website?: string | null;
      location?: string | null;
      twitterUrl?: string | null;
      discordUrl?: string | null;
      githubUrl?: string | null;
      instagramUrl?: string | null;
      isPublic?: boolean;
    },
  ) {
    const [updatedProfile] = await db
      .update(userProfile)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userProfile.userId, userId))
      .returning();

    if (!updatedProfile) {
      throw new Error("User profile not found");
    }

    return updatedProfile;
  }

  static async followUser(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error("Cannot follow yourself");
    }

    const targetUser = await db.query.user.findFirst({
      where: eq(user.id, followingId),
    });

    if (!targetUser) {
      throw new Error("User not found");
    }

    try {
      await db.insert(userFollow).values({
        followerId,
        followingId,
      });
      return { success: true, message: "Successfully followed user" };
    } catch (error) {
      if (error instanceof Error && error.message.includes("unique constraint")) {
        throw new Error("Already following this user");
      }
      throw error;
    }
  }

  static async unfollowUser(followerId: string, followingId: string) {
    const result = await db
      .delete(userFollow)
      .where(and(eq(userFollow.followerId, followerId), eq(userFollow.followingId, followingId)))
      .returning();

    if (result.length === 0) {
      throw new Error("Not following this user");
    }

    return { success: true, message: "Successfully unfollowed user" };
  }

  static async isFollowing(followerId: string, followingId: string) {
    const result = await db
      .select({ followerId: userFollow.followerId })
      .from(userFollow)
      .where(and(eq(userFollow.followerId, followerId), eq(userFollow.followingId, followingId)))
      .limit(1);

    return result.length > 0;
  }

  static async getFollowers(userId: string) {
    const followers = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        image: user.image,
        profile: getTableColumns(userProfile),
      })
      .from(userFollow)
      .innerJoin(user, eq(userFollow.followerId, user.id))
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(eq(userFollow.followingId, userId));

    return Promise.all(
      followers.map(async (f) => ({
        id: f.id,
        name: f.name,
        username: f.username,
        email: f.email,
        isAdmin: f.isAdmin,
        image: f.image,
        profile: f.profile,
        followerCount: await this.getFollowerCount(f.id),
        followingCount: await this.getFollowingCount(f.id),
      })),
    );
  }

  static async getFollowing(userId: string) {
    const following = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        image: user.image,
        profile: getTableColumns(userProfile),
      })
      .from(userFollow)
      .innerJoin(user, eq(userFollow.followingId, user.id))
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(eq(userFollow.followerId, userId));

    return Promise.all(
      following.map(async (f) => ({
        id: f.id,
        name: f.name,
        username: f.username,
        email: f.email,
        isAdmin: f.isAdmin,
        image: f.image,
        profile: f.profile,
        followerCount: await this.getFollowerCount(f.id),
        followingCount: await this.getFollowingCount(f.id),
      })),
    );
  }

  static async getFollowerCount(userId: string) {
    const result = await db
      .select({ count: count() })
      .from(userFollow)
      .where(eq(userFollow.followingId, userId));

    return result[0]?.count || 0;
  }

  static async getFollowingCount(userId: string) {
    const result = await db
      .select({ count: count() })
      .from(userFollow)
      .where(eq(userFollow.followerId, userId));

    return result[0]?.count || 0;
  }

  static async getFollowCounts(userId: string) {
    const [followerResult, followingResult] = await Promise.all([
      db.select({ count: count() }).from(userFollow).where(eq(userFollow.followingId, userId)),
      db.select({ count: count() }).from(userFollow).where(eq(userFollow.followerId, userId)),
    ]);

    return {
      followerCount: followerResult[0]?.count || 0,
      followingCount: followingResult[0]?.count || 0,
    };
  }

  static async getPublicUserLibrary(userId: string) {
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
        },
      })
      .from(userAnime)
      .innerJoin(anime, eq(userAnime.animeId, anime.id))
      .where(eq(userAnime.userId, userId))
      .orderBy(asc(userAnime.createdAt));

    return library.map((e) => ({
      id: e.id,
      animeId: e.animeId,
      status: e.status,
      currentEpisode: e.currentEpisode,
      rating: e.rating,
      createdAt: e.createdAt,
      anime: e.anime,
    }));
  }

  static async searchUsers(query: string, limit: number = 20) {
    const searchPattern = `%${query}%`;

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        image: user.image,
        profile: getTableColumns(userProfile),
      })
      .from(user)
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(and(ilike(user.name, searchPattern), eq(userProfile.isPublic, true)))
      .limit(limit);

    return Promise.all(
      users.map(async (u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        isAdmin: u.isAdmin,
        image: u.image,
        profile: u.profile,
        followerCount: await this.getFollowerCount(u.id),
        followingCount: await this.getFollowingCount(u.id),
      })),
    );
  }

  static async getAdminStats() {
    const [result] = await db.select({ count: count() }).from(user);
    return { totalUsers: result?.count ?? 0 };
  }

  static async getAdminStatus(userId: string) {
    const found = await db.query.user.findFirst({
      where: eq(user.id, userId),
      columns: { isAdmin: true },
    });
    return found?.isAdmin ?? false;
  }

  static async searchUsersForAdmin(
    query: string,
    options: { limit?: number; offset?: number } = {},
  ) {
    const limit = Math.min(Math.max(options.limit ?? 20, 1), 100);
    const offset = Math.max(options.offset ?? 0, 0);
    const normalized = query.trim();

    const whereClause = normalized
      ? or(
          ilike(user.name, `%${normalized}%`),
          ilike(user.username, `%${normalized}%`),
          ilike(user.email, `%${normalized}%`),
        )
      : undefined;

    const rows = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        image: user.image,
        profile: getTableColumns(userProfile),
      })
      .from(user)
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(whereClause)
      .orderBy(asc(user.createdAt))
      .limit(limit)
      .offset(offset);

    const [totalResult] = await db.select({ count: count() }).from(user).where(whereClause);

    const users = await Promise.all(
      rows.map(async (entry) => ({
        id: entry.id,
        name: entry.name,
        username: entry.username,
        email: entry.email,
        isAdmin: entry.isAdmin,
        image: entry.image,
        profile: entry.profile,
        followerCount: await this.getFollowerCount(entry.id),
        followingCount: await this.getFollowingCount(entry.id),
      })),
    );

    return {
      users,
      total: totalResult?.count ?? 0,
      limit,
      offset,
    };
  }

  static async setUserAdminStatus(targetUserId: string, isAdmin: boolean, actorUserId?: string) {
    if (actorUserId && actorUserId === targetUserId && !isAdmin) {
      throw new Error("You cannot remove your own admin access");
    }

    const [updated] = await db
      .update(user)
      .set({
        isAdmin,
        updatedAt: new Date(),
      })
      .where(eq(user.id, targetUserId))
      .returning({
        id: user.id,
        isAdmin: user.isAdmin,
      });

    if (!updated) {
      throw new Error("User not found");
    }

    return updated;
  }
}
