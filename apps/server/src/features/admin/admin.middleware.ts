import { Elysia } from "elysia";
import { forbiddenError } from "../../lib/api-error";
import { authMiddleware } from "../../middleware/auth.middleware";
import { UsersService } from "../users/users.service";

export const adminMiddleware = (app: Elysia) =>
  app.use(authMiddleware).derive(async ({ userId }) => {
    const { isAdmin } = await UsersService.getAdminStatus(userId);

    if (!isAdmin) {
      throw forbiddenError("Forbidden");
    }

    return {
      adminUserId: userId,
    };
  });
