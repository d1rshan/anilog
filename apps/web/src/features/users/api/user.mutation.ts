import type { UpdateUserProfileBody, UserParams } from "@anilog/contracts";
import { userClient } from "./user.client";

export const userMutations = {
  follow: () => ({
    mutationFn: ({ params }: { params: UserParams }) => userClient.follow(params),
  }),

  unfollow: () => ({
    mutationFn: ({ params }: { params: UserParams }) => userClient.unfollow(params),
  }),

  updateMyProfile: () => ({
    mutationFn: ({ body }: { body: UpdateUserProfileBody }) => userClient.updateMyProfile(body),
  }),
};
