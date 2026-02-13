"use client";

import { useState } from "react";
import { toast } from "sonner";
import { type Anime } from "@anilog/db/schema/anilog";

import { authClient } from "@/lib/auth-client";
import { useAddToFavorites, useRemoveFromFavorites, useUserLists, useAddAnimeToList } from "@/features/lists/lib/hooks";

import { useSearchAnime, useUpsertAnime } from "../lib/hooks";
import { AnimeCard } from "./anime-card";
import { AddToListDialog } from "./add-to-list-dialog";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const { data: anime, isLoading, isError, error } = useSearchAnime(query);
  const { data: lists } = useUserLists();
  const upsertAnime = useUpsertAnime();
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
  const addAnimeToList = useAddAnimeToList();
  
  const [addToListDialog, setAddToListDialog] = useState<{
    isOpen: boolean;
    animeId: number;
    animeTitle: string;
  }>({
    isOpen: false,
    animeId: 0,
    animeTitle: "",
  });

  // Derive favorite anime IDs from user lists
  const favoritesList = lists?.find(list => list.name === "Favorites");
  const favoriteIds = new Set(favoritesList?.entries.map(entry => entry.animeId) || []);

  const handleAddToList = async (animeId: number) => {
    const { data: session } = await authClient.getSession();
    if (!session?.user?.id) {
      toast.error("Please sign in to add anime to lists", {
        description: "You need to be logged in to create and manage lists.",
      });
      return;
    }

    const animeItem = anime?.find((a: Anime) => a.id === animeId);
    if (!animeItem) return;

    // First upsert the anime to ensure it exists in DB
    upsertAnime.mutate(animeItem, {
      onSuccess: () => {
        setAddToListDialog({
          isOpen: true,
          animeId,
          animeTitle: animeItem.title || "Unknown Anime",
        });
      },
    });
  };

  const handleFavorite = async (animeId: number) => {
    const { data: session } = await authClient.getSession();
    if (!session?.user?.id) {
      toast.error("Please sign in to manage favorites", {
        description: "You need to be logged in to add or remove anime from favorites.",
      });
      return;
    }

    const animeItem = anime?.find((a: Anime) => a.id === animeId);
    if (!animeItem) return;

    if (favoriteIds.has(animeId)) {
      // Remove from favorites - anime should already exist in DB
      removeFromFavorites.mutate(animeId);
    } else {
      // Add to favorites - first upsert anime, then add to favorites
      upsertAnime.mutate(animeItem, {
        onSuccess: () => {
          addToFavorites.mutate(animeId);
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-full space-y-3">
            <div className="aspect-[2/3] rounded-md bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full animate-pulse" />
              <div className="h-2 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">
          SEARCH ERROR
        </p>
        <p className="text-xl font-bold">
          {error instanceof Error ? error.message : "Failed to search anime"}
        </p>
      </div>
    );
  }

  if (!anime || anime.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-2">
          NO RESULTS
        </p>
        <p className="text-xl font-bold">
          Nothing found for &quot;{query}&quot;
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {anime.map((animeItem: Anime) => (
          <div key={animeItem.id} className="w-full">
            <AnimeCard
              anime={animeItem}
              onAddToList={handleAddToList}
              onFavorite={handleFavorite}
              isFavorited={favoriteIds.has(animeItem.id)}
            />
          </div>
        ))}
      </div>
      <AddToListDialog
        animeId={addToListDialog.animeId}
        animeTitle={addToListDialog.animeTitle}
        isOpen={addToListDialog.isOpen}
        onOpenChange={(open) =>
          setAddToListDialog((prev) => ({ ...prev, isOpen: open }))
        }
      />
    </>
  );
}
