import { inArray, sql } from "drizzle-orm";
import { db } from "../../client";
import { userFollow } from "../../schema/anilog";

export type FollowCounts = {
  followerCount: number;
  followingCount: number;
};

export async function getFollowCountsMap(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, FollowCounts>();
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

  const counts = new Map<string, FollowCounts>();

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
