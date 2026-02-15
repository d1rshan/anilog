import { headers } from "next/headers";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";

import { requireCurrentUser } from "@/features/auth/lib/server";
import {
  myLibraryQueryOptions,
  searchAnimeQueryOptions,
  trendingAnimeQueryOptions,
} from "@/lib/query-options";
import { cn } from "@/lib/utils";

import { HomeDiscovery } from "../components/home-discovery";
import { HomeHero } from "../components/home-hero";
import { SearchResults } from "../components/search-results";
import { AnimeSearch } from "../components/anime-search";

interface HomePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const HomePage = async ({ searchParams }: HomePageProps) => {
  await requireCurrentUser(await headers());
  const params = await searchParams;

  const searchQuery = typeof params.search === "string" ? params.search : "";
  const isSearching = searchQuery.length >= 3;

  const queryClient = new QueryClient();

  if (isSearching) {
    await Promise.all([
      queryClient.prefetchQuery(searchAnimeQueryOptions(searchQuery)),
      queryClient.prefetchQuery(myLibraryQueryOptions()),
    ]);
  } else {
    await Promise.all([
      queryClient.prefetchQuery(trendingAnimeQueryOptions()),
      queryClient.prefetchQuery(myLibraryQueryOptions()),
    ]);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {!isSearching && <HomeHero />}

      <div className={cn("container mx-auto px-4", isSearching ? "py-20 md:py-32" : "pt-8 pb-24 md:pt-12 md:pb-40")}>
        {isSearching && (
          <div className="mb-10 space-y-4 md:mb-14 md:space-y-6">
            <AnimeSearch />
            <div className="space-y-4">
              <h1 className="font-display text-3xl font-black uppercase tracking-tighter sm:text-4xl md:text-7xl">
                Results for &quot;{searchQuery}&quot;
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
                Found across the archive
              </p>
            </div>
          </div>
        )}

        <HydrationBoundary state={dehydrate(queryClient)}>
          {isSearching ? (
            <SearchResults query={searchQuery} />
          ) : (
            <HomeDiscovery />
          )}
        </HydrationBoundary>
      </div>
    </div>
  );
};
