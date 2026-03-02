import { db } from "@anilog/db";
import { userProfile, userFollow, heroCuration } from "@anilog/db/schema/anilog";
import { user } from "@anilog/db/schema/auth";
import { asc, count, eq, getTableColumns, ilike, or } from "drizzle-orm";
import { notFoundError, validationError } from "../errors/api-error";
import { type UpdateHeroCurationBody } from "../schemas";

export class AdminService {
  static async getAdminStats() {
    const [result] = await db.select({ count: count() }).from(user);
    return { totalUsers: result?.count ?? 0 };
  }

  static async searchUsers(query: string, options: { limit?: number; offset?: number } = {}) {
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
      throw validationError("You cannot remove your own admin access");
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
      throw notFoundError("User not found");
    }

    return updated;
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

  static async getHeroCurationsForAdmin() {
    return db
      .select()
      .from(heroCuration)
      .orderBy(asc(heroCuration.sortOrder), asc(heroCuration.id));
  }

  static async updateHeroCuration(id: number, payload: UpdateHeroCurationBody) {
    if (payload.start < 0) {
      throw validationError("Start timestamp must be zero or greater");
    }

    if (payload.stop <= payload.start) {
      throw validationError("Stop timestamp must be greater than start timestamp");
    }

    const requiredTextFields = [
      { value: payload.videoId, name: "videoId" },
      { value: payload.title, name: "title" },
      { value: payload.subtitle, name: "subtitle" },
      { value: payload.description, name: "description" },
      { value: payload.tag, name: "tag" },
    ];

    for (const field of requiredTextFields) {
      if (!field.value.trim()) {
        throw validationError(`${field.name} is required`);
      }
    }

    if (payload.sortOrder < 0) {
      throw validationError("sortOrder must be zero or greater");
    }

    const [updated] = await db
      .update(heroCuration)
      .set({
        videoId: payload.videoId.trim(),
        start: payload.start,
        stop: payload.stop,
        title: payload.title.trim(),
        subtitle: payload.subtitle.trim(),
        description: payload.description.trim(),
        tag: payload.tag.trim(),
        sortOrder: payload.sortOrder,
        isActive: payload.isActive,
        updatedAt: new Date(),
      })
      .where(eq(heroCuration.id, id))
      .returning();

    if (!updated) {
      throw notFoundError("Hero curation not found");
    }

    return updated;
  }
}
