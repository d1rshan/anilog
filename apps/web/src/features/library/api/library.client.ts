import { api } from "@/lib/api";
import { edenFetch } from "@/lib/eden-fetch";
import type {
  LibraryAnimeParams,
  LogAnimeBody,
  UpdateLibraryProgressBody,
  UpdateLibraryRatingBody,
  UpdateLibraryStatusBody,
} from "@anilog/contracts";

export const libraryClient = {
  getMine: () => edenFetch(() => api.library.me.get()),
  log: (body: LogAnimeBody) => edenFetch(() => api.library.me.log.post(body)),
  updateStatus: (params: LibraryAnimeParams, body: UpdateLibraryStatusBody) =>
    edenFetch(() => api.library.me(params).status.patch(body)),
  updateProgress: (params: LibraryAnimeParams, body: UpdateLibraryProgressBody) =>
    edenFetch(() => api.library.me(params).progress.patch(body)),
  updateRating: (params: LibraryAnimeParams, body: UpdateLibraryRatingBody) =>
    edenFetch(() => api.library.me(params).rating.patch(body)),
  remove: (params: LibraryAnimeParams) => edenFetch(() => api.library.me(params).delete()),
};
