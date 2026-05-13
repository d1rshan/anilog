import { db } from "../../client";
import { heroCuration } from "./admin.schema";
import { userProfile } from "../users/users.schema";
import { user } from "../auth/auth.schema";
import { asc, count, eq, ilike, or } from "drizzle-orm";
import { getFollowCountsMap } from "../users/users.helpers";
import { userSummarySelect, type UserSummaryRecord } from "../users/users.helpers";

export type AdminUserRecord = UserSummaryRecord & {
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

export class AdminQueries {
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
      .select(userSummarySelect())
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
