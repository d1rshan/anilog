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
