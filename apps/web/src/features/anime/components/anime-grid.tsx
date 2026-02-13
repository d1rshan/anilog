"use client";

import { useState } from "react";
import { toast } from "sonner";
import { type Anime } from "@anilog/db/schema/anilog";

import { authClient } from "@/lib/auth-client";
import { useAddToFavorites, useRemoveFromFavorites, useUserLists } from "@/features/lists/lib/hooks";

import { useTrendingAnime } from "../lib/hooks";
import { AnimeCard } from "./anime-card";
import { AddToListDialog } from "./add-to-list-dialog";

export function AnimeGrid() {
  const { data: anime = [], isLoading, isError, error } = useTrendingAnime();
  const { data: lists } = useUserLists();
  const addToFavorites = useAddToFavorites();
  const removeFromFavorites = useRemoveFromFavorites();
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
    setAddToListDialog({
      isOpen: true,
      animeId,
      animeTitle: animeItem?.title || "Unknown Anime",
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

    if (favoriteIds.has(animeId)) {
      removeFromFavorites.mutate(animeId);
    } else {
      addToFavorites.mutate(animeId);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
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
          ERROR
        </p>
        <p className="text-xl font-bold">
          {error instanceof Error ? error.message : "Failed to load anime"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {anime?.map((animeItem: Anime) => (
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
