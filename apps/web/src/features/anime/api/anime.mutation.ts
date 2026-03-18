import type { UpsertAnimeBody } from "@anilog/contracts";
import { animeClient } from "./anime.client";

export const animeMutations = {
  upsertAnime: () => ({
    mutationFn: ({ body }: { body: UpsertAnimeBody }) => animeClient.upsert(body),
  }),
};
