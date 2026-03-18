import type {
  AdminStatusDto,
  FollowActionDto,
  PublicLibraryEntryDto,
  UpdateUserProfileBody,
  UserProfileDto,
  UserSearchQuery,
  UserWithProfileDto,
} from "@anilog/contracts";
import { UsersRepository } from "@anilog/db";
import {
  conflictError,
  internalError,
  notFoundError,
  validationError,
} from "../shared/errors/api-error";

export class UserService {
  static async createUserProfile(userId: string): Promise<UserProfileDto> {
    const profile = await UsersRepository.createUserProfile(userId);

    if (profile) {
      return profile;
    }

    const existingProfile = await UsersRepository.findUserProfileRecord(userId);

    if (!existingProfile) {
      throw internalError("Failed to create or find user profile");
    }

    return existingProfile;
  }

  static async getUserProfile(userId: string): Promise<UserWithProfileDto | null> {
    return UsersRepository.findUserById(userId);
  }

  static async getUserProfileOrThrow(userId: string, message: string = "User not found") {
    const profile = await this.getUserProfile(userId);
    if (!profile) {
      throw notFoundError(message);
    }

    return profile;
  }

  static async getUserByUsername(username: string): Promise<UserWithProfileDto | null> {
    return UsersRepository.findUserByUsername(username);
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
    const updatedProfile = await UsersRepository.updateUserProfile(userId, data);

    if (!updatedProfile) {
      throw notFoundError("User profile not found");
    }

    return updatedProfile;
  }

  static async followUser(followerId: string, followingId: string): Promise<FollowActionDto> {
    if (followerId === followingId) {
      throw validationError("Cannot follow yourself");
    }

    if (!(await UsersRepository.findUserExists(followingId))) {
      throw notFoundError("User not found");
    }

    try {
      await UsersRepository.createFollow(followerId, followingId);
      return { success: true, message: "Successfully followed user" };
    } catch (error) {
      if (error instanceof Error && error.message.includes("unique constraint")) {
        throw conflictError("Already following this user");
      }
      throw error;
    }
  }

  static async unfollowUser(followerId: string, followingId: string): Promise<FollowActionDto> {
    const result = await UsersRepository.deleteFollow(followerId, followingId);

    if (result.length === 0) {
      throw notFoundError("Not following this user");
    }

    return { success: true, message: "Successfully unfollowed user" };
  }

  static async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    return Boolean(await UsersRepository.findFollow(followerId, followingId));
  }

  static async getFollowers(userId: string): Promise<UserWithProfileDto[]> {
    return UsersRepository.findFollowers(userId);
  }

  static async getFollowing(userId: string): Promise<UserWithProfileDto[]> {
    return UsersRepository.findFollowing(userId);
  }

  static async getPublicUserLibrary(userId: string): Promise<PublicLibraryEntryDto[]> {
    return UsersRepository.findPublicLibrary(userId);
  }

  static async searchUsers(
    input: UserSearchQuery,
    limit: number = 20,
  ): Promise<UserWithProfileDto[]> {
    return UsersRepository.searchUsers(input.q, limit);
  }

  static async getAdminStatus(userId: string): Promise<AdminStatusDto> {
    return UsersRepository.findAdminStatus(userId);
  }
}
