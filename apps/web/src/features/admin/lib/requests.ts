import { api } from "@/lib/api";
import { unwrapEdenResponse } from "@/lib/eden";

type AdminHeroCurationsRoute = ReturnType<(typeof api.admin)["hero-curations"]>;
type HeroCurationUpdateInput = Parameters<AdminHeroCurationsRoute["patch"]>[0];

export async function getAdminStats() {
  const res = await api.admin.stats.get();
  return unwrapEdenResponse(res);
}

export async function getAdminUsers(params: { query: string; limit?: number; offset?: number }) {
  const res = await api.admin.users.get({
    query: {
      q: params.query,
      limit: params.limit,
      offset: params.offset,
    },
  });

  return unwrapEdenResponse(res);
}

export async function setAdminStatus(input: { userId: string; isAdmin: boolean }) {
  const res = await api.admin.users({ id: input.userId }).admin.patch({
    isAdmin: input.isAdmin,
  });

  return unwrapEdenResponse(res);
}

export async function getAdminHeroCurations() {
  const res = await api.admin["hero-curations"].get();
  return unwrapEdenResponse(res);
}

export async function updateAdminHeroCuration(input: {
  id: number;
  data: HeroCurationUpdateInput;
}) {
  const res = await api.admin["hero-curations"]({ id: input.id }).patch(input.data);
  return unwrapEdenResponse(res);
}
