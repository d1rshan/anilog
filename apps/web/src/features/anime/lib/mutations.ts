import { api } from "@/lib/api";
import { edenMutationOptions } from "@/lib/eden-query";

type UpsertAnimePayload = Parameters<typeof api.anime.upsert.post>[0];

export const animeMutations = {
  upsertAnime: () =>
    edenMutationOptions({
      mutationFn: (animeData: UpsertAnimePayload) => api.anime.upsert.post(animeData),
    }),
};
