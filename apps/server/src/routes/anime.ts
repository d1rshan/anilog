import { Elysia, t } from "elysia";
import { AnimeService } from "@anilog/api";

const ANILIST_API = "https://graphql.anilist.co";

export const animeRoutes = new Elysia({ prefix: "/anime" })
  .get("/", async () => {
    try {
      const anime = await AnimeService.getAllAnime();
      return { success: true, data: anime };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch anime"
      };
    }
  })
  .get("/:id", async ({ params }) => {
    try {
      const anime = await AnimeService.getAnimeById(params.id);
      if (!anime) {
        return { success: false, error: "Anime not found" };
      }
      return { success: true, data: anime };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch anime"
      };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  .get(
    "/search/:query",
    async ({ params }) => {
      const query = `
        query ($search: String!) {
          Page(page: 1, perPage: 5) {
            media(search: $search, type: ANIME) {
              id
              title {
                english
                native
              }
              episodes
              coverImage {
                large
                color
              }
            }
          }
        }
      `;

      try {
        const res = await fetch(ANILIST_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            query,
            variables: {
              search: params.query
            }
          })
        });

        const json: any = await res.json();

        if (json.errors) {
          throw new Error(json.errors[0].message);
        }

        return {
          success: true,
          data: json.data.Page.media
        };
      } catch (error) {
        return {
          success: false,
          data: { id: "", title: { english: "", native: "" }, episodes: "", coverImage: { color: "", large: "" } }
        };
      }
    },
    {
      params: t.Object({
        query: t.String()
      }),
      response: t.Object({
        success: t.Boolean(),
        data: t.Object({
          id: t.String(),
          title: t.Object({ english: t.String(), native: t.String() }),
          episodes: t.String(),
          coverImage: t.Object({ large: t.String(), color: t.String() }),
        }),
      })
    }
  );
