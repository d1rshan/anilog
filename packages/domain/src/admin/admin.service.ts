import type {
  AdminStatsDto,
  AdminUsersDto,
  AdminUsersQuery,
  HeroCurationDto,
  SetUserAdminStatusDto,
  UpdateHeroCurationBody,
} from "@anilog/contracts";
import { AdminRepository } from "@anilog/db/repositories/admin.repo";
import { notFoundError, validationError } from "../shared/errors/api-error";

export class AdminService {
  static async getAdminStats(): Promise<AdminStatsDto> {
    return { totalUsers: await AdminRepository.getTotalUsers() };
  }

  static async searchUsers(input: AdminUsersQuery): Promise<AdminUsersDto> {
    const limit = input.limit ?? 20;
    const offset = input.offset ?? 0;
    const result = await AdminRepository.searchUsers({
      q: input.q,
      limit,
      offset,
    });

    return {
      users: result.users,
      total: result.total,
      limit,
      offset,
    };
  }

  static async setUserAdminStatus(
    targetUserId: string,
    isAdmin: boolean,
    actorUserId?: string,
  ): Promise<SetUserAdminStatusDto> {
    if (actorUserId && actorUserId === targetUserId && !isAdmin) {
      throw validationError("You cannot remove your own admin access");
    }

    const updated = await AdminRepository.updateUserAdminStatus(targetUserId, isAdmin);

    if (!updated) {
      throw notFoundError("User not found");
    }

    return updated;
  }

  static async getHeroCurationsForAdmin(): Promise<HeroCurationDto[]> {
    return AdminRepository.findHeroCurations();
  }

  static async updateHeroCuration(
    id: number,
    payload: UpdateHeroCurationBody,
  ): Promise<HeroCurationDto> {
    if (payload.stop <= payload.start) {
      throw validationError("Stop timestamp must be greater than start timestamp");
    }

    const requiredTextFields = [
      { value: payload.videoId, name: "videoId" },
      { value: payload.title, name: "title" },
      { value: payload.subtitle, name: "subtitle" },
      { value: payload.description, name: "description" },
      { value: payload.tag, name: "tag" },
    ];

    for (const field of requiredTextFields) {
      if (!field.value.trim()) {
        throw validationError(`${field.name} is required`);
      }
    }

    const updated = await AdminRepository.updateHeroCuration(id, {
      videoId: payload.videoId.trim(),
      start: payload.start,
      stop: payload.stop,
      title: payload.title.trim(),
      subtitle: payload.subtitle.trim(),
      description: payload.description.trim(),
      tag: payload.tag.trim(),
      sortOrder: payload.sortOrder,
      isActive: payload.isActive,
    });

    if (!updated) {
      throw notFoundError("Hero curation not found");
    }

    return updated;
  }
}
