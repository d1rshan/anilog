import { db } from "@anilog/db";
import { userFollow, userProfile, userList, listEntry, anime } from "@anilog/db/schema/anilog";
import { user } from "@anilog/db/schema/auth";
import { eq, getTableColumns, count, and, ilike } from "drizzle-orm";
import type { UserProfile } from "@anilog/db/schema/anilog";

export type ProfileData = {
  bio?: string | null;
  displayName?: string | null;
  website?: string | null;
  location?: string | null;
  isPublic?: boolean;
};

export type UserWithProfile = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  image: string | null;
  profile: UserProfile | null;
  followerCount: number;
  followingCount: number;
};

export type PublicUserLists = {
  id: string;
  name: string;
  createdAt: Date;
  entries: {
    id: string;
    currentEpisode: number;
    rating: number | null;
    anime: {
      id: number;
      title: string;
      titleJapanese: string | null;
      imageUrl: string;
      year: number | null;
      episodes: number | null;
    };
  }[];
}[];

export class UserService {
  static async createUserProfile(userId: string): Promise<UserProfile> {
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

  static async getUserProfile(userId: string): Promise<UserWithProfile | null> {
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
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
      image: userData.image,
      profile: userData.profile,
      followerCount,
      followingCount,
    };
  }

  static async getUserByUsername(username: string): Promise<UserWithProfile | null> {
    const result = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
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
      image: userData.image,
      profile: userData.profile,
      followerCount,
      followingCount,
    };
  }

  static async updateUserProfile(
    userId: string,
    data: ProfileData
  ): Promise<UserProfile> {
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

  static async followUser(
    followerId: string,
    followingId: string
  ): Promise<{ success: boolean; message: string }> {
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

  static async unfollowUser(
    followerId: string,
    followingId: string
  ): Promise<{ success: boolean; message: string }> {
    const result = await db
      .delete(userFollow)
      .where(
        and(
          eq(userFollow.followerId, followerId),
          eq(userFollow.followingId, followingId)
        )
      )
      .returning();

    if (result.length === 0) {
      throw new Error("Not following this user");
    }

    return { success: true, message: "Successfully unfollowed user" };
  }

  static async isFollowing(
    followerId: string,
    followingId: string
  ): Promise<boolean> {
    const result = await db.query.userFollow.findFirst({
      where: (follow, { and, eq }) =>
        and(
          eq(follow.followerId, followerId),
          eq(follow.followingId, followingId)
        ),
    });

    return !!result;
  }

  static async getFollowers(userId: string): Promise<UserWithProfile[]> {
    const followers = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
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
        image: f.image,
        profile: f.profile,
        followerCount: await this.getFollowerCount(f.id),
        followingCount: await this.getFollowingCount(f.id),
      }))
    );
  }

  static async getFollowing(userId: string): Promise<UserWithProfile[]> {
    const following = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
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
        image: f.image,
        profile: f.profile,
        followerCount: await this.getFollowerCount(f.id),
        followingCount: await this.getFollowingCount(f.id),
      }))
    );
  }

  static async getFollowerCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(userFollow)
      .where(eq(userFollow.followingId, userId));

    return result[0]?.count || 0;
  }

  static async getFollowingCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(userFollow)
      .where(eq(userFollow.followerId, userId));

    return result[0]?.count || 0;
  }

  static async getFollowCounts(userId: string): Promise<{
    followerCount: number;
    followingCount: number;
  }> {
    const [followerResult, followingResult] = await Promise.all([
      db.select({ count: count() }).from(userFollow).where(eq(userFollow.followingId, userId)),
      db.select({ count: count() }).from(userFollow).where(eq(userFollow.followerId, userId)),
    ]);

    return {
      followerCount: followerResult[0]?.count || 0,
      followingCount: followingResult[0]?.count || 0,
    };
  }

  static async getPublicUserLists(userId: string): Promise<PublicUserLists> {
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

        return {
          ...list,
          entries: entries.map((e) => ({
            id: e.id,
            currentEpisode: e.currentEpisode,
            rating: e.rating,
            anime: e.anime,
          })),
        };
      })
    );
  }

  static async searchUsers(
    query: string,
    limit: number = 20
  ): Promise<UserWithProfile[]> {
    const searchPattern = `%${query}%`;

    const users = await db
      .select({
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        profile: getTableColumns(userProfile),
      })
      .from(user)
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(
        and(
          ilike(user.name, searchPattern),
          eq(userProfile.isPublic, true)
        )
      )
      .limit(limit);

    return Promise.all(
      users.map(async (u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        image: u.image,
        profile: u.profile,
        followerCount: await this.getFollowerCount(u.id),
        followingCount: await this.getFollowingCount(u.id),
      }))
    );
  }
}
