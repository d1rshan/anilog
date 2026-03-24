import type {
  AdminStatusDto,
  FollowActionDto,
  PublicLibraryEntryDto,
  UpdateUserProfileBody,
  UserProfileDto,
  UserSearchQuery,
  UserWithProfileDto,
} from "@anilog/contracts";
import { UsersQueries } from "@anilog/db";
import { conflictError, internalError, notFoundError, validationError } from "../../lib/api-error";

export class UsersService {
  static async createUserProfile(userId: string): Promise<UserProfileDto> {
    const profile = await UsersQueries.createUserProfile(userId);

    if (profile) {
      return profile;
    }

    const existingProfile = await UsersQueries.findUserProfileRecord(userId);

    if (!existingProfile) {
      throw internalError("Failed to create or find user profile");
    }

    return existingProfile;
  }

  static async getUserProfile(userId: string): Promise<UserWithProfileDto | null> {
    return UsersQueries.findUserById(userId);
  }

  static async getUserProfileOrThrow(userId: string, message: string = "User not found") {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      throw notFoundError(message);
    }

    return profile;
  }

  static async getUserByUsername(username: string): Promise<UserWithProfileDto | null> {
    return UsersQueries.findUserByUsername(username);
  }

  static async getUserByUsernameOrThrow(username: string, message: string = "User not found") {
    const foundUser = await this.getUserByUsername(username);
    if (!foundUser) {
      throw notFoundError(message);
    }

    return foundUser;
  }

  static async updateUserProfile(
    userId: string,
    data: UpdateUserProfileBody,
  ): Promise<UserProfileDto> {
    const updatedProfile = await UsersQueries.updateUserProfile(userId, data);

    if (!updatedProfile) {
      throw notFoundError("User profile not found");
    }

    return updatedProfile;
  }

  static async followUser(followerId: string, followingId: string): Promise<FollowActionDto> {
    if (followerId === followingId) {
      throw validationError("Cannot follow yourself");
    }

    if (!(await UsersQueries.findUserExists(followingId))) {
      throw notFoundError("User not found");
    }

    const created = await UsersQueries.createFollow(followerId, followingId);

    if (!created) {
      throw conflictError("Already following this user");
    }

    return { success: true, message: "Successfully followed user" };
  }

  static async unfollowUser(followerId: string, followingId: string): Promise<FollowActionDto> {
    const result = await UsersQueries.deleteFollow(followerId, followingId);

    if (result.length === 0) {
      throw notFoundError("Not following this user");
    }

    return { success: true, message: "Successfully unfollowed user" };
  }

  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return Boolean(await UsersQueries.findFollow(followerId, followingId));
  }

  static async getFollowers(userId: string): Promise<UserWithProfileDto[]> {
    return UsersQueries.findFollowers(userId);
  }

  static async getFollowing(userId: string): Promise<UserWithProfileDto[]> {
    return UsersQueries.findFollowing(userId);
  }

  static async getPublicUserLibrary(userId: string): Promise<PublicLibraryEntryDto[]> {
    return UsersQueries.findPublicLibrary(userId);
  }

  static async searchUsers(
    input: UserSearchQuery,
    limit: number = 20,
  ): Promise<UserWithProfileDto[]> {
    return UsersQueries.searchUsers(input.q, limit);
  }

  static async getAdminStatus(userId: string): Promise<AdminStatusDto> {
    return UsersQueries.findAdminStatus(userId);
  }
}
