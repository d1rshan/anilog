import { getTableColumns } from "drizzle-orm";
import { userProfile } from "../../schema/anilog";
import { user } from "../../schema/auth";

export type UserProfileRecord = typeof userProfile.$inferSelect;

export type UserSummaryRecord = {
  id: string;
  name: string;
  username: string | null;
  email: string;
  isAdmin: boolean;
  image: string | null;
  profile: UserProfileRecord | null;
};

export function userSummarySelect() {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    isAdmin: user.isAdmin,
    image: user.image,
    profile: getTableColumns(userProfile),
  };
}
