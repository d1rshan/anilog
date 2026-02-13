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
    <div className="container mx-auto px-4 py-32">
      <div className="mb-32 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <div className="relative z-10">
          <h1 className="font-display text-[12vw] font-extrabold uppercase leading-[0.8] tracking-tighter text-foreground mix-blend-difference md:text-[14vw]">
            Anilog
          </h1>
          <div className="mt-4 h-2 w-24 bg-foreground" />
        </div>
        <p className="max-w-md text-right text-sm font-medium leading-relaxed text-muted-foreground md:text-base">
          A curatorial platform for the modern otaku. Track, rate, and discover anime with uncompromising aesthetic precision.
        </p>
      </div>

      <div className="space-y-16">
        <div className="flex flex-col gap-8 border-t border-white/10 pt-8 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <h2 className="font-display text-4xl font-bold uppercase leading-none tracking-tight md:text-6xl">
              {isSearching ? `"${searchQuery}"` : "Trending Now"}
            </h2>
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
              {isSearching ? "Search Results" : "Global Top 50"}
            </p>
          </div>
          <div className="w-full md:w-auto">
            <AnimeSearch />
          </div>
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
