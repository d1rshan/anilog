import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getTrendingAnime } from "../lib/requests";
import { AnimeGrid } from "../components/anime-grid";
import { getSession } from "@/features/auth/lib/server";

export default async function HomePage() {
  const session = await getSession(await headers());

  if (!session?.user) {
    redirect("/login");
  }

  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["trending-anime"],
    queryFn: getTrendingAnime,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Anilog</h1>
        <p className="text-lg text-muted-foreground">
          Discover, track, and rate your favorite anime
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Popular Anime</h2>

        <HydrationBoundary state={dehydrate(queryClient)}>
          <AnimeGrid />
        </HydrationBoundary>
      </div>
    </div>
  );
}
