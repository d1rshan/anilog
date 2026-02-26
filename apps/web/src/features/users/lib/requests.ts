import { api } from "@/lib/api";
import { unwrapEdenResponse } from "@/lib/eden";

export type UpdateProfileData = Parameters<typeof api.users.me.profile.put>[0];

export async function searchUsers(query: string) {
  const res = await api.users.search.get({ query: { q: query } });
  return unwrapEdenResponse(res);
}

export async function getUserProfile(userId: string) {
  const res = await api.users({ id: userId }).get();
  return unwrapEdenResponse(res);
}

export async function getUserByUsername(username: string) {
  const res = await api.users.username({ username }).get();
  return unwrapEdenResponse(res);
}

export async function getUserPublicLibrary(userId: string) {
  const res = await api.users({ id: userId }).library.get();
  return unwrapEdenResponse(res);
}

export async function followUser(userId: string) {
  const res = await api.users({ id: userId }).follow.post();
  return unwrapEdenResponse(res);
}

export async function unfollowUser(userId: string) {
  const res = await api.users({ id: userId }).follow.delete();
  return unwrapEdenResponse(res);
}

export async function checkIsFollowing(userId: string) {
  const res = await api.users.me["check-follow"]({ id: userId }).get();
  const data = unwrapEdenResponse(res);
  return data.isFollowing;
}

export async function getMyFollowing() {
  const res = await api.users.me.following.get();
  return unwrapEdenResponse(res);
}

export async function getMyProfile() {
  const res = await api.users.me.profile.get();
  return unwrapEdenResponse(res);
}

export async function getMyAdminStatus() {
  const res = await api.users.me["admin-status"].get();
  return unwrapEdenResponse(res);
}

export async function updateMyProfile(data: UpdateProfileData) {
  const res = await api.users.me.profile.put(data);
  return unwrapEdenResponse(res);
}

export type UserWithProfile = Awaited<ReturnType<typeof getUserProfile>>;
export type PublicUserLibrary = Awaited<ReturnType<typeof getUserPublicLibrary>>;
