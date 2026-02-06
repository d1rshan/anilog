import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getTrendingAnime, searchAnime } from "../lib/requests";
import { AnimeGrid } from "../components/anime-grid";
import { AnimeSearch } from "../components/anime-search";
import { SearchResults } from "../components/search-results";
import { getSession } from "@/features/auth/lib/server";

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await getSession(await headers());
  const params = await searchParams;

  if (!session?.user) {
    redirect("/login");
  }

  const searchQuery = typeof params.search === "string" ? params.search : "";
  const isSearching = searchQuery.length >= 3;

  const queryClient = new QueryClient();

  if (isSearching) {
    await queryClient.prefetchQuery({
      queryKey: ["search-anime", searchQuery],
      queryFn: () => searchAnime(searchQuery),
    });
  } else {
    await queryClient.prefetchQuery({
      queryKey: ["trending-anime"],
      queryFn: getTrendingAnime,
    });
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Anilog</h1>
        <p className="text-lg text-muted-foreground">
          Discover, track, and rate your favorite anime
        </p>
      </div>

      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-semibold">
            {isSearching ? `Search Results for "${searchQuery}"` : "Popular Anime"}
          </h2>
          <AnimeSearch />
        </div>

        <HydrationBoundary state={dehydrate(queryClient)}>
          {isSearching ? (
            <SearchResults query={searchQuery} />
          ) : (
            <AnimeGrid />
          )}
        </HydrationBoundary>
      </div>
    </div>
  );
}
