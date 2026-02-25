import type { LibraryStatus, UserProfile } from "@anilog/db/schema/anilog";

export type ProfileData = {
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

export type UserWithProfile = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  isAdmin: boolean;
  image: string | null;
  profile: UserProfile | null;
  followerCount: number;
  followingCount: number;
};

export type FollowActionResult = {
  success: boolean;
  message: string;
};

export type PublicUserLibraryEntry = {
  id: string;
  animeId: number;
  status: LibraryStatus;
  currentEpisode: number;
  rating: number | null;
  createdAt: Date;
  anime: {
    id: number;
    title: string;
    titleJapanese: string | null;
    imageUrl: string;
    year: number | null;
    episodes: number | null;
    status: string | null;
  };
};

export type PublicUserLibrary = PublicUserLibraryEntry[];

export type AdminUserListResult = {
  users: UserWithProfile[];
  total: number;
  limit: number;
  offset: number;
};
