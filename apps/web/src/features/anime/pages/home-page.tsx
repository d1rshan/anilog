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

      <div className={cn("container mx-auto px-4", isSearching ? "py-32" : "py-24 md:py-48")}>
        {isSearching && (
          <div className="mb-16 space-y-4">
            <h1 className="font-display text-5xl font-black uppercase tracking-tighter md:text-7xl">
              Results for &quot;{searchQuery}&quot;
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/60">
              Found across the archive
            </p>
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
