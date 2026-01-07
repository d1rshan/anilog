import { NextResponse } from "next/server";
import { db } from '@anilog/db'
import { anime, trendingAnime } from "@anilog/db/schema/anime";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");

  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const query = `
      query TrendingAnime {
        Page(page: 1, perPage: 100) {
          media(
            type: ANIME
            sort: TRENDING_DESC
            isAdult: false
          ) {
            id
            title {
              english
              native
            }
            description
            episodes
            status
            genres
            coverImage {
              large
            }
            seasonYear
            averageScore
          }
        }
      }
    `;

    const res = await fetch(process.env.ANILIST_API!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ query })
    });

    if (!res.ok) {
      throw new Error("AniList API failed");
    }

    type TrendingAnimeQueryResponse = {
      data: {
        Page: {
          media: Array<{
            id: number;
            title: {
              english: string | null;
              native: string | null;
            };
            description: string | null;
            episodes: number | null;
            status: "FINISHED" | "RELEASING" | "NOT_YET_RELEASED" | "CANCELLED" | "HIATUS" | null;
            genres: string[];
            coverImage: {
              large: string;
            };
            seasonYear: number | null;
            averageScore: number | null;
          }>;
        };
      };
    };

    const json = (await res.json()) as TrendingAnimeQueryResponse;

    const inserts = json.data.Page.media.map((media) => ({
      id: media.id,
      title: media.title.english ?? media.title.native ?? "UNKNOWN",
      titleJapanese: media.title.native,
      description: media.description,
      episodes: media.episodes,
      status: media.status,
      genres: media.genres,
      imageUrl: media.coverImage?.large,
      year: media.seasonYear,
      rating: media.averageScore,
    }));


    // TODO: ZOD VALIDATION BEFORE INSERT
    // const parsed = inserts.map((row) =>
    //   animeInsertSchema.parse(row)
    // );

    // Upsert anime data
    await db.insert(anime).values(inserts).onConflictDoUpdate({
      target: anime.id,
      set: {
        title: anime.title,
        titleJapanese: anime.titleJapanese,
        description: anime.description,
        episodes: anime.episodes,
        status: anime.status,
        genres: anime.genres,
        imageUrl: anime.imageUrl,
        year: anime.year,
        rating: anime.rating,
        updatedAt: new Date()
      }
    });

    // Clear existing trending data
    await db.delete(trendingAnime);

    // Insert new trending data with ranks
    const trendingInserts = json.data.Page.media.map((media, index) => ({
      animeId: media.id,
      rank: index + 1
    }));

    await db.insert(trendingAnime).values(trendingInserts);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Cron failed" },
      { status: 500 }
    );
  }
}
