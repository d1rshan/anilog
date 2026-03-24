export const usersKeys = {
  all: ["users"] as const,
  searchRoot: () => [...usersKeys.all, "search"] as const,
  search: (query: string) => [...usersKeys.all, "search", query] as const,
  profileRoot: () => [...usersKeys.all, "profile"] as const,
  profile: (userId: string) => [...usersKeys.all, "profile", userId] as const,
  byUsernameRoot: () => [...usersKeys.all, "username"] as const,
  byUsername: (username: string) => [...usersKeys.all, "username", username] as const,
  isFollowing: (userId: string) => [...usersKeys.all, "is-following", userId] as const,
  following: () => [...usersKeys.all, "following"] as const,
  meProfile: () => [...usersKeys.all, "me", "profile"] as const,
  meAdminStatus: () => [...usersKeys.all, "me", "admin-status"] as const,
};
