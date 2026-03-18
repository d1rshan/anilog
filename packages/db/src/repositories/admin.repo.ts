import { db } from "../client";
import { heroCuration, userFollow, userProfile } from "../schema/anilog";
import { user } from "../schema/auth";
import { asc, count, eq, getTableColumns, ilike, inArray, or, sql } from "drizzle-orm";

export type AdminUserRecord = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  isAdmin: boolean;
  image: string | null;
  profile: typeof userProfile.$inferSelect | null;
  followerCount: number;
  followingCount: number;
};

type HeroCurationUpdateInput = Pick<
  typeof heroCuration.$inferInsert,
  | "videoId"
  | "start"
  | "stop"
  | "title"
  | "subtitle"
  | "description"
  | "tag"
  | "sortOrder"
  | "isActive"
>;

function adminUserSelect() {
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

export class AdminRepository {
  static async getTotalUsers() {
    const [result] = await db.select({ count: count() }).from(user);
    return result?.count ?? 0;
  }

  static async searchUsers(input: { q?: string; limit: number; offset: number }) {
    const normalized = (input.q ?? "").trim();

    const whereClause = normalized
      ? or(
          ilike(user.name, `%${normalized}%`),
          ilike(user.username, `%${normalized}%`),
          ilike(user.email, `%${normalized}%`),
        )
      : undefined;

    const rows = await db
      .select(adminUserSelect())
      .from(user)
      .leftJoin(userProfile, eq(user.id, userProfile.userId))
      .where(whereClause)
      .orderBy(asc(user.createdAt))
      .limit(input.limit)
      .offset(input.offset);

    const [totalResult] = await db.select({ count: count() }).from(user).where(whereClause);
    const counts = await getFollowCountsMap(rows.map((row) => row.id));

    return {
      users: rows.map((row) => ({
        ...row,
        ...(counts.get(row.id) ?? { followerCount: 0, followingCount: 0 }),
      })),
      total: totalResult?.count ?? 0,
    };
  }

  static async updateUserAdminStatus(targetUserId: string, isAdmin: boolean) {
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

    return updated ?? null;
  }

  static async findHeroCurations() {
    return db
      .select()
      .from(heroCuration)
      .orderBy(asc(heroCuration.sortOrder), asc(heroCuration.id));
  }

  static async updateHeroCuration(id: number, payload: HeroCurationUpdateInput) {
    const [updated] = await db
      .update(heroCuration)
      .set(payload)
      .where(eq(heroCuration.id, id))
      .returning();

    return updated ?? null;
  }
}
