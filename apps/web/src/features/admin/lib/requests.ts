import { api } from "@/lib/api";
import type { HeroCuration } from "@/features/anime/lib/requests";
import type { UserWithProfile } from "@/features/users/lib/requests";

export type AdminStats = {
  totalUsers: number;
};

export type AdminUsersResult = {
  users: UserWithProfile[];
  total: number;
  limit: number;
  offset: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const res = await api.admin.stats.get();

  if (res.error) {
    throw res.error;
  }

  return res.data as AdminStats;
}

export async function getAdminUsers(params: {
  query: string;
  limit?: number;
  offset?: number;
}): Promise<AdminUsersResult> {
  const res = await api.admin.users.get({
    query: {
      q: params.query,
      limit: params.limit,
      offset: params.offset,
    },
  });

  if (res.error) {
    throw res.error;
  }

  return res.data as AdminUsersResult;
}

export async function setAdminStatus(input: {
  userId: string;
  isAdmin: boolean;
}): Promise<{ id: string; isAdmin: boolean }> {
  const res = await api.admin.users({ id: input.userId }).admin.patch({
    isAdmin: input.isAdmin,
  });

  if (res.error) {
    throw res.error;
  }

  return res.data as { id: string; isAdmin: boolean };
}

export async function getAdminHeroCurations(): Promise<HeroCuration[]> {
  const res = await api.admin["hero-curations"].get();

  if (res.error) {
    throw res.error;
  }

  return res.data as HeroCuration[];
}

export async function updateAdminHeroCuration(input: {
  id: number;
  data: Pick<
    HeroCuration,
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
}): Promise<HeroCuration> {
  const res = await api.admin["hero-curations"]({ id: input.id }).patch(input.data);

  if (res.error) {
    throw res.error;
  }

  return res.data as HeroCuration;
}
