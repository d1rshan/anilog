export const libraryKeys = {
  all: ["library"] as const,
  me: () => [...libraryKeys.all, "me"] as const,
  publicByUserId: (userId: string) => ["users", "library", userId] as const,
};
