"use client";

import { useMemo, useState } from "react";
import { type Anime, type LibraryStatus } from "@anilog/db/schema/anilog";

import { useAuth, useRequireAuth } from "@/features/auth/lib/hooks";
import {
  useLogAnime,
  useMyLibrary,
} from "@/features/lists/lib/hooks";
import { type LibraryEntryWithAnime } from "@/features/lists/lib/requests";
import { useTrendingAnime } from "../lib/hooks";
import { AnimeCard } from "./anime-card";
import { AddToListDialog } from "./add-to-list-dialog";

type DialogState = {
  isOpen: boolean;
  anime: Anime | null;
  initialStatus?: LibraryStatus;
  entry?: LibraryEntryWithAnime | null;
};

export function AnimeGrid() {
  const { isAuthenticated } = useAuth();
  const { data: anime = [], isLoading, isError, error } = useTrendingAnime();
  const { requireAuth } = useRequireAuth({
    toastMessage: "Please sign in to log anime",
  });
  const { data: library } = useMyLibrary({ enabled: isAuthenticated });
  const logAnime = useLogAnime();
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, anime: null });

  const entryByAnimeId = useMemo(
    () => new Map((isAuthenticated ? (library ?? []) : []).map((entry) => [entry.animeId, entry])),
    [isAuthenticated, library],
  );

  const getAnime = (animeId: number) => anime.find((item) => item.id === animeId);

  const openEditor = (animeId: number, initialStatus?: LibraryStatus) => {
    if (!requireAuth()) {
      return;
    }

    const selectedAnime = getAnime(animeId);
    if (!selectedAnime) {
      return;
    }

    setDialog({
      isOpen: true,
      anime: selectedAnime,
      initialStatus,
      entry: entryByAnimeId.get(animeId) ?? null,
    });
  };

  const handleAddToWatchlist = (animeId: number) => {
    if (!requireAuth()) {
      return;
    }

    const selectedAnime = getAnime(animeId);
    if (!selectedAnime) {
      return;
    }

    if (entryByAnimeId.has(animeId)) {
      return;
    }

    logAnime.mutate({ anime: selectedAnime, status: "planned", currentEpisode: 0, rating: null });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-full space-y-3">
            <div className="aspect-[2/3] animate-pulse rounded-md bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-2 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="mb-2 text-sm font-black uppercase tracking-widest text-muted-foreground">ERROR</p>
        <p className="text-xl font-bold">{error instanceof Error ? error.message : "Failed to load anime"}</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
        {anime.map((animeItem: Anime) => {
          const entry = entryByAnimeId.get(animeItem.id);

          return (
            <div key={animeItem.id} className="w-full">
              <AnimeCard
                anime={animeItem}
                rating={entry?.rating}
                currentEpisode={entry?.currentEpisode}
                loggedStatus={entry?.status}
                actionMode="discovery"
                onAddToWatchlist={handleAddToWatchlist}
                onQuickAdd={(id) => openEditor(id)}
              />
            </div>
          );
        })}
      </div>

      <AddToListDialog
        anime={dialog.anime}
        entry={dialog.entry}
        initialStatus={dialog.initialStatus}
        isOpen={dialog.isOpen}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, isOpen: open }))}
      />
    </>
  );
}
