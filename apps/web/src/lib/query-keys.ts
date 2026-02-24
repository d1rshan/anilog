export const animeKeys = {
  all: ["anime"] as const,
  heroCurations: () => [...animeKeys.all, "hero-curations"] as const,
  trending: () => [...animeKeys.all, "trending"] as const,
  search: (query: string) => [...animeKeys.all, "search", query] as const,
  archiveSearch: (query: string) => [...animeKeys.all, "archive-search", query] as const,
};

export const libraryKeys = {
  all: ["library"] as const,
  me: () => [...libraryKeys.all, "me"] as const,
  publicByUserId: (userId: string) => ["users", "library", userId] as const,
};

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: (query: string, limit: number, offset: number) =>
    [...adminKeys.all, "users", query, limit, offset] as const,
  heroCurations: () => [...adminKeys.all, "hero-curations"] as const,
};

export const userKeys = {
  all: ["users"] as const,
  searchRoot: () => [...userKeys.all, "search"] as const,
  search: (query: string) => [...userKeys.all, "search", query] as const,
  profileRoot: () => [...userKeys.all, "profile"] as const,
  profile: (userId: string) => [...userKeys.all, "profile", userId] as const,
  byUsernameRoot: () => [...userKeys.all, "username"] as const,
  byUsername: (username: string) => [...userKeys.all, "username", username] as const,
  isFollowing: (userId: string) => [...userKeys.all, "is-following", userId] as const,
  following: () => [...userKeys.all, "following"] as const,
  meProfile: () => [...userKeys.all, "me", "profile"] as const,
  meAdminStatus: () => [...userKeys.all, "me", "admin-status"] as const,
};
