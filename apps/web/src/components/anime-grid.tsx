"use client";

import { useState, useEffect } from "react";
import { AnimeCard } from "./anime-card";
import { AddToListDialog } from "./add-to-list-dialog";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { type Anime } from "@anilog/db/schema/anime";

export function AnimeGrid() {
  const [anime, setAnime] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addToListDialog, setAddToListDialog] = useState<{
    isOpen: boolean;
    animeId: number;
    animeTitle: string;
  }>({
    isOpen: false,
    animeId: 0,
    animeTitle: ""
  });

  useEffect(() => {
    fetchAnime();
  }, []);

  const fetchAnime = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/anime');
      const data = await response.json();

      if (data.success) {
        setAnime(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch anime');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch anime');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToList = async (animeId: number) => {
    const { data: session } = await authClient.getSession();
    if (!session?.user?.id) {
      toast.error("Please sign in to add anime to lists", {
        description: "You need to be logged in to create and manage lists."
      });
      return;
    }

    const animeItem = anime.find(a => a.id === animeId);
    setAddToListDialog({
      isOpen: true,
      animeId,
      animeTitle: animeItem?.title || "Unknown Anime"
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-lg text-muted-foreground mb-4">Failed to load anime</p>
        <p className="text-sm text-muted-foreground mb-4">{error}</p>
        <button
          onClick={fetchAnime}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {anime.map((animeItem) => (
          <AnimeCard
            key={animeItem.id}
            anime={animeItem}
            onAddToList={handleAddToList}
          />
        ))}
      </div>
      <AddToListDialog
        animeId={addToListDialog.animeId}
        animeTitle={addToListDialog.animeTitle}
        isOpen={addToListDialog.isOpen}
        onOpenChange={(open) => setAddToListDialog(prev => ({ ...prev, isOpen: open }))}
      />
    </>
  );
}
