export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: (query: string, limit: number, offset: number) =>
    [...adminKeys.all, "users", query, limit, offset] as const,
  heroCurations: () => [...adminKeys.all, "hero-curations"] as const,
};
