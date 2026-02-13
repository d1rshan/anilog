import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getTrendingAnime, searchAnime } from "../lib/requests";
import { getMyLibrary } from "@/features/lists/lib/requests";
import { HomeDiscovery } from "../components/home-discovery";
import { HomeHero } from "../components/home-hero";
import { SearchResults } from "../components/search-results";
import { getSession } from "@/features/auth/lib/server";
import { cn } from "@/lib/utils";

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
    // Prefetch both trending and user library for instant loading of HomeDiscovery
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: ["trending-anime"],
        queryFn: getTrendingAnime,
      }),
      queryClient.prefetchQuery({
        queryKey: ["library", "me"],
        queryFn: getMyLibrary,
      }),
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
}
