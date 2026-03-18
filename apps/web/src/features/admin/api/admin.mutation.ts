import type {
  HeroCurationParams,
  SetUserAdminStatusBody,
  UpdateHeroCurationBody,
  UserParams,
} from "@anilog/contracts";
import { adminClient } from "./admin.client";

export const adminMutations = {
  setAdminStatus: () => ({
    mutationFn: ({ params, body }: { params: UserParams; body: SetUserAdminStatusBody }) =>
      adminClient.setAdminStatus(params, body),
  }),

  updateHeroCuration: () => ({
    mutationFn: ({ params, body }: { params: HeroCurationParams; body: UpdateHeroCurationBody }) =>
      adminClient.updateHeroCuration(params, body),
  }),
};
