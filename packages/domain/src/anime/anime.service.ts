import type {
  AnimeDto,
  ArchiveSearchDto,
  HeroCurationDto,
  SuccessCountDto,
  UpsertAnimeBody,
  UpsertAnimeDto,
} from "@anilog/contracts";
import { AnimeRepository } from "@anilog/db";
import { externalServiceError, internalError } from "../shared/errors/api-error";

const ANILIST_API = "https://graphql.anilist.co";
const SEARCH_CACHE_TTL_MS = 30_000;
const ANILIST_CACHE_TTL_MS = 60_000;

type SearchCacheValue = {
  expiresAt: number;
  value: ArchiveSearchDto;
};

type AniListCacheValue = {
  expiresAt: number;
  value: AnimeDto[];
};

const archiveSearchCache = new Map<string, SearchCacheValue>();
const anilistSearchCache = new Map<string, AniListCacheValue>();

export class AnimeService {
  static async getHeroCurations(): Promise<HeroCurationDto[]> {
    return AnimeRepository.findHeroCurations();
  }

  static async getTrendingAnime(): Promise<AnimeDto[]> {
    return AnimeRepository.findTrendingAnime();
  }

  static async searchArchive(
    userId: string,
    userQuery: string,
    limit: number = 12,
  ): Promise<ArchiveSearchDto> {
    const q = userQuery.trim().toLowerCase();
    if (q.length < 2) return { library: [], archive: [] };

    const cacheKey = `${userId}:${q}:${limit}`;

    const cached = archiveSearchCache.get(cacheKey);
    if (cached && cached?.expiresAt > Date.now()) {
      return cached.value;
    }

    const pattern = `%${q}%`;

    const score = (item: AnimeDto) => {
      let best = 0;
      const titles = [item.title, item.titleJapanese];

      for (const t of titles) {
        if (!t) continue;
        const title = t.toLowerCase();

        if (title === q) return 4;
        if (title.startsWith(q)) best = Math.max(best, 3);
        if (new RegExp(`(^|\\s|[-:()])${q}`).test(title)) best = Math.max(best, 2);
        if (title.includes(q)) best = Math.max(best, 1);
      }

      return best;
    };

    const rank = (rows: AnimeDto[]) =>
      rows
        .map((item) => ({ item, score: score(item) }))
        .filter((r) => r.score > 0)
        .sort((a, b) =>
          b.score !== a.score
            ? b.score - a.score
            : b.item.updatedAt.getTime() - a.item.updatedAt.getTime(),
        )
        .slice(0, limit)
        .map((r) => r.item);

    const library = rank(await AnimeRepository.findArchiveLibraryMatches(userId, pattern));
    const excludeIds = library.map((a) => a.id);

    const archiveRows = await AnimeRepository.findArchiveMatches(pattern, excludeIds, limit * 4);
    const archive = rank(archiveRows);
    const value = { library, archive };

    archiveSearchCache.set(cacheKey, {
      expiresAt: Date.now() + SEARCH_CACHE_TTL_MS,
      value,
    });

    return value;
  }

  static async syncTrendingAnime(): Promise<SuccessCountDto> {
    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
        query TrendingAnime {
          Page(page: 1, perPage: 100) {
            media(
              type: ANIME
              sort: TRENDING_DESC
              isAdult: false
            ) {
              id
              title { english native }
              episodes
              status
              genres
              coverImage { large }
              seasonYear
              averageScore
            }
          }
        }
      `,
      }),
    });

    if (!res.ok) {
      throw externalServiceError("AniList API failed");
    }

    const {
      data: {
        Page: { media },
      },
    } = (await res.json()) as {
      data: {
        Page: { media: any[] };
      };
    };

    const animeInserts = media.map((m) => {
      const fallbackTitle = m.title?.native || "UNKNOWN";

      return {
        id: m.id,
        title: m.title?.english || fallbackTitle,
        titleJapanese: m.title?.native || "",
        episodes: m.episodes ?? 0,
        status: m.status || "UNKNOWN",
        genres: m.genres ?? [],
        imageUrl: m.coverImage?.large || "",
        year: m.seasonYear ?? 0,
        rating: m.averageScore ?? 0,
      };
    });

    await AnimeRepository.upsertAnimeMany(animeInserts);
    await AnimeRepository.replaceTrending(media.map((m) => m.id));

    return { success: true, count: media.length };
  }

  static async searchAnime(userQuery: string): Promise<AnimeDto[]> {
    const q = userQuery.trim().toLowerCase();
    if (q.length < 3) return [];

    const cached = anilistSearchCache.get(q);
    if (cached && cached?.expiresAt > Date.now()) {
      return cached.value;
    }

    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `
        query ($search: String!) {
          Page(page: 1, perPage: 20) {
            media(search: $search, type: ANIME, isAdult: false) {
              id
              title { english native }
              episodes
              status
              genres
              coverImage { large }
              seasonYear
              averageScore
            }
          }
        }
      `,
        variables: { search: q },
      }),
    });

    const json = (await res.json()) as any;

    if (json.errors?.length) {
      throw externalServiceError(json.errors[0]?.message ?? "AniList returned an error");
    }

    const media = json.data?.Page?.media ?? [];

    const result = media
      .filter((m: any) => m.coverImage?.large)
      .map((m: any) => {
        const fallbackTitle = m.title?.native || "UNKNOWN";

        return {
          id: m.id,
          title: m.title?.english || fallbackTitle,
          titleJapanese: m.title?.native || "",
          episodes: m.episodes ?? 0,
          status: m.status || "UNKNOWN",
          genres: m.genres ?? [],
          imageUrl: m.coverImage.large,
          year: m.seasonYear ?? 0,
          rating: m.averageScore ?? 0,
        };
      });

    anilistSearchCache.set(q, {
      expiresAt: Date.now() + ANILIST_CACHE_TTL_MS,
      value: result,
    });

    return result;
  }

  static async upsertAnime(animeData: UpsertAnimeBody): Promise<UpsertAnimeDto> {
    try {
      await AnimeRepository.upsertAnime({
        id: animeData.id,
        title: animeData.title,
        titleJapanese: animeData.titleJapanese,
        episodes: animeData.episodes,
        status: animeData.status,
        genres: animeData.genres,
        imageUrl: animeData.imageUrl,
        year: animeData.year,
        rating: animeData.rating,
      });

      return { id: animeData.id, success: true };
    } catch (error) {
      console.error("Error upserting anime:", error);
      throw internalError("Failed to upsert anime");
    }
  }
}
