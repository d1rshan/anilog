export const animeKeys = {
  all: ["anime"] as const,
  heroCurations: () => [...animeKeys.all, "hero-curations"] as const,
  trending: () => [...animeKeys.all, "trending"] as const,
  search: (query: string) => [...animeKeys.all, "search", query] as const,
  archiveSearch: (query: string) => [...animeKeys.all, "archive-search", query] as const,
};
