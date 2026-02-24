import { api } from "@/lib/api";
import type { UserProfile, LibraryStatus } from "@anilog/db/schema/anilog";

export type UserWithProfile = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  image: string | null;
  profile: UserProfile | null;
  followerCount: number;
  followingCount: number;
};

export type PublicUserLibrary = {
  id: string;
  animeId: number;
  status: LibraryStatus;
  createdAt: Date;
  currentEpisode: number;
  rating: number | null;
  anime: {
    id: number;
    title: string;
    titleJapanese: string | null;
    imageUrl: string;
    year: number | null;
    episodes: number | null;
    status?: string | null;
  };
}[];

export async function searchUsers(query: string): Promise<UserWithProfile[]> {
  const res = await api.users.search.get({ query: { q: query } });

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function getUserProfile(userId: string): Promise<UserWithProfile> {
  const res = await api.users({ id: userId }).get();

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function getUserByUsername(username: string): Promise<UserWithProfile> {
  const res = await api.users.username({ username }).get();

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function getUserPublicLibrary(userId: string): Promise<PublicUserLibrary> {
  const res = await api.users({ id: userId }).library.get();

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function followUser(userId: string) {
  const res = await api.users({ id: userId }).follow.post();

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function unfollowUser(userId: string) {
  const res = await api.users({ id: userId }).follow.delete();

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function checkIsFollowing(userId: string): Promise<boolean> {
  const res = await api.users.me["check-follow"]({ id: userId }).get();

  if (res.error) {
    throw res.error;
  }

  return res.data.isFollowing;
}

export async function getMyFollowing(): Promise<UserWithProfile[]> {
  const res = await api.users.me.following.get();

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function getMyProfile(): Promise<UserWithProfile> {
  const res = await api.users.me.profile.get();

  if (res.error) {
    throw res.error;
  }

  return res.data;
}

export async function getMyAdminStatus(): Promise<{ isAdmin: boolean }> {
  const res = await api.users.me["admin-status"].get();

  if (res.error) {
    throw res.error;
  }

  return res.data as { isAdmin: boolean };
}

export type UpdateProfileData = {
  bio?: string | null;
  displayName?: string | null;
  website?: string | null;
  location?: string | null;
  twitterUrl?: string | null;
  discordUrl?: string | null;
  githubUrl?: string | null;
  instagramUrl?: string | null;
  isPublic?: boolean;
};

export async function updateMyProfile(data: UpdateProfileData): Promise<UserProfile> {
  const res = await api.users.me.profile.put(data);

  if (res.error) {
    throw res.error;
  }

  return res.data;
}
