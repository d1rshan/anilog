import { Elysia } from "elysia";
import { forbiddenError } from "../lib/api-error";
import { UserService } from "../features/users/users.service";
import { authPlugin } from "./auth.plugin";

export const adminPlugin = (app: Elysia) =>
  app.use(authPlugin).derive(async ({ userId }) => {
    const { isAdmin } = await UserService.getAdminStatus(userId);

    if (!isAdmin) {
      throw forbiddenError("Forbidden");
    }

    return {
      adminUserId: userId,
    };
  });
