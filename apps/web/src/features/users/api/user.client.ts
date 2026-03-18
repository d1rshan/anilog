import { api } from "@/lib/api";
import { edenFetch } from "@/lib/eden-fetch";
import type {
  UpdateUserProfileBody,
  UserParams,
  UserSearchQuery,
  UsernameParams,
} from "@anilog/contracts";

export const userClient = {
  search: (query: UserSearchQuery) => edenFetch(() => api.users.search.get({ query })),
  getProfile: (params: UserParams) => edenFetch(() => api.users(params).get()),
  getByUsername: (params: UsernameParams) => edenFetch(() => api.users.username(params).get()),
  getPublicLibrary: (params: UserParams) => edenFetch(() => api.users(params).library.get()),
  getIsFollowing: async (params: UserParams) => {
    const data = await edenFetch(() => api.users.me["check-follow"](params).get());
    return { isFollowing: data.isFollowing };
  },
  getMyFollowing: () => edenFetch(() => api.users.me.following.get()),
  getMyProfile: () => edenFetch(() => api.users.me.profile.get()),
  getMyAdminStatus: () => edenFetch(() => api.users.me["admin-status"].get()),
  follow: (params: UserParams) => edenFetch(() => api.users(params).follow.post()),
  unfollow: (params: UserParams) => edenFetch(() => api.users(params).follow.delete()),
  updateMyProfile: (body: UpdateUserProfileBody) => edenFetch(() => api.users.me.profile.put(body)),
};
