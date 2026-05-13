import type {
  AdminStatsDto,
  AdminUsersDto,
  AdminUsersQuery,
  HeroCurationDto,
  SetUserAdminStatusDto,
  UpdateHeroCurationBody,
} from "@anilog/contracts";
import { AdminQueries } from "@anilog/db";
import { notFoundError, validationError } from "../../lib/api-error";

export class AdminService {
  static async getAdminStats(): Promise<AdminStatsDto> {
    return { totalUsers: await AdminQueries.getTotalUsers() };
  }

  static async searchUsers(input: AdminUsersQuery): Promise<AdminUsersDto> {
    const limit = input.limit ?? 20;
    const offset = input.offset ?? 0;
    const result = await AdminQueries.searchUsers({
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

    const updated = await AdminQueries.updateUserAdminStatus(targetUserId, isAdmin);

    if (!updated) {
      throw notFoundError("User not found");
    }

    return updated;
  }

  static async getHeroCurationsForAdmin(): Promise<HeroCurationDto[]> {
    return AdminQueries.findHeroCurations();
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

    const updated = await AdminQueries.updateHeroCuration(id, {
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
