import { api } from "@/lib/api";
import { edenFetch } from "@/lib/eden-fetch";
import type { ArchiveSearchQuery, UpsertAnimeBody } from "@anilog/contracts";

export const animeClient = {
  getTrending: () => edenFetch(() => api.anime.trending.get()),
  getHeroCurations: () => edenFetch(() => api.anime["hero-curations"].get()),
  search: (query: string) => edenFetch(() => api.anime.search({ query }).get()),
  archiveSearch: (query: ArchiveSearchQuery) =>
    edenFetch(() => api.anime["archive-search"].get({ query })),
  upsert: (body: UpsertAnimeBody) => edenFetch(() => api.anime.upsert.post(body)),
};
