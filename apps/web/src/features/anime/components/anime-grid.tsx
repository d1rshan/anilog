"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { type Anime, type LibraryStatus } from "@anilog/db/schema/anilog";

import { useSession } from "@/features/auth/lib/hooks";
import {
  useLogAnime,
  useMyLibrary,
  useUpdateLibraryProgress,
  useUpdateLibraryStatus,
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
  const { data: anime = [], isLoading, isError, error } = useTrendingAnime();
  const { data: session } = useSession();
  const { data: library } = useMyLibrary();
  const logAnime = useLogAnime();
  const updateStatus = useUpdateLibraryStatus();
  const updateProgress = useUpdateLibraryProgress();
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, anime: null });

  const entryByAnimeId = useMemo(
    () => new Map((library ?? []).map((entry) => [entry.animeId, entry])),
    [library],
  );

  const ensureAuth = () => {
    if (!session?.user?.id) {
      toast.error("Please sign in to log anime");
      return false;
    }

    return true;
  };

  const getAnime = (animeId: number) => anime.find((item) => item.id === animeId);

  const openEditor = (animeId: number, initialStatus?: LibraryStatus) => {
    if (!ensureAuth()) {
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

  const handlePlan = (animeId: number) => {
    if (!ensureAuth()) {
      return;
    }

    const selectedAnime = getAnime(animeId);
    if (!selectedAnime) {
      return;
    }

    logAnime.mutate({ anime: selectedAnime, status: "planned", currentEpisode: 0, rating: null });
  };

  const handleIncrementEpisode = (animeId: number) => {
    if (!ensureAuth()) {
      return;
    }

    updateProgress.mutate({ animeId, delta: 1 });
  };

  const handleComplete = (animeId: number) => {
    if (!ensureAuth()) {
      return;
    }

    updateStatus.mutate({ animeId, status: "completed" });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {anime.map((animeItem: Anime) => {
          const entry = entryByAnimeId.get(animeItem.id);

          return (
            <div key={animeItem.id} className="w-full">
              <AnimeCard
                anime={animeItem}
                rating={entry?.rating}
                currentEpisode={entry?.currentEpisode}
                loggedStatus={entry?.status}
                onPlan={handlePlan}
                onStartWatching={(id) => openEditor(id, "watching")}
                onIncrementEpisode={handleIncrementEpisode}
                onComplete={handleComplete}
                onOpenEditor={(id) => openEditor(id)}
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
