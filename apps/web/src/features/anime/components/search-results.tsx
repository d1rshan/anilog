"use client";

import { useMemo, useState } from "react";
import { type Anime, type LibraryStatus } from "@anilog/db/schema/anilog";

import { useRequireAuth } from "@/features/auth/lib/hooks";
import { useLogAnime, useMyLibrary } from "@/features/lists/lib/hooks";
import { type LibraryEntryWithAnime } from "@/features/lists/lib/requests";
import { cn } from "@/lib/utils";

import { useArchiveSearch, useSearchAnime } from "../lib/hooks";
import { AddToListDialog } from "./add-to-list-dialog";
import { AnimeCard } from "./anime-card";

interface SearchResultsProps {
  query: string;
}

type DialogState = {
  isOpen: boolean;
  anime: Anime | null;
  initialStatus?: LibraryStatus;
  entry?: LibraryEntryWithAnime | null;
};

function ResultSection({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5 md:space-y-6">
      <div className="space-y-2 border-b border-white/5 pb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.45em] text-muted-foreground/60">{subtitle}</p>
        <h2 className="font-display text-2xl font-black uppercase tracking-tighter sm:text-3xl md:text-5xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function AnimeGrid({ items, entryByAnimeId, onAddToWatchlist, onQuickAdd }: {
  items: Anime[];
  entryByAnimeId: Map<number, LibraryEntryWithAnime>;
  onAddToWatchlist: (animeId: number) => void;
  onQuickAdd: (animeId: number, initialStatus?: LibraryStatus) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
      {items.map((animeItem) => {
        const entry = entryByAnimeId.get(animeItem.id);

        return (
          <div key={animeItem.id} className="w-full">
            <AnimeCard
              anime={animeItem}
              rating={entry?.rating}
              currentEpisode={entry?.currentEpisode}
              loggedStatus={entry?.status}
              actionMode="discovery"
              onAddToWatchlist={onAddToWatchlist}
              onQuickAdd={(id) => onQuickAdd(id)}
            />
          </div>
        );
      })}
    </div>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
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

export function SearchResults({ query }: SearchResultsProps) {
  const { data: archiveResults, isLoading: isArchiveLoading, isError: isArchiveError, error: archiveError } = useArchiveSearch(query);
  const {
    data: anilistResults,
    isLoading: isAniListLoading,
    isError: isAniListError,
    error: aniListError,
  } = useSearchAnime(query);

  const { requireAuth } = useRequireAuth({
    toastMessage: "Please sign in to log anime",
  });
  const { data: library } = useMyLibrary();
  const logAnime = useLogAnime();
  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, anime: null });

  const entryByAnimeId = useMemo(
    () => new Map((library ?? []).map((entry) => [entry.animeId, entry])),
    [library],
  );

  const animeById = useMemo(() => {
    const byId = new Map<number, Anime>();
    for (const item of archiveResults?.library ?? []) byId.set(item.id, item);
    for (const item of archiveResults?.archive ?? []) byId.set(item.id, item);
    for (const item of anilistResults ?? []) byId.set(item.id, item);
    return byId;
  }, [anilistResults, archiveResults?.archive, archiveResults?.library]);

  const dedupedAniList = useMemo(() => {
    const existingIds = new Set<number>([
      ...(archiveResults?.library ?? []).map((item) => item.id),
      ...(archiveResults?.archive ?? []).map((item) => item.id),
    ]);

    return (anilistResults ?? []).filter((item) => !existingIds.has(item.id));
  }, [anilistResults, archiveResults?.archive, archiveResults?.library]);

  const openEditor = (animeId: number, initialStatus?: LibraryStatus) => {
    if (!requireAuth()) {
      return;
    }

    const selectedAnime = animeById.get(animeId);
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

    if (entryByAnimeId.has(animeId)) {
      return;
    }

    const selectedAnime = animeById.get(animeId);
    if (!selectedAnime) {
      return;
    }

    logAnime.mutate({ anime: selectedAnime, status: "planned", currentEpisode: 0, rating: null });
  };

  const hasArchiveMatches = (archiveResults?.library.length ?? 0) > 0 || (archiveResults?.archive.length ?? 0) > 0;
  const hasAniListMatches = dedupedAniList.length > 0;
  const showAniListSection = query.trim().length >= 3;

  return (
    <>
      <div className="space-y-14 md:space-y-16">
        <ResultSection title={`Results for \"${query}\"`} subtitle="From Your Archive">
          {isArchiveLoading ? (
            <LoadingGrid />
          ) : isArchiveError ? (
            <p className="text-sm font-black uppercase tracking-widest text-destructive">
              {archiveError instanceof Error ? archiveError.message : "Failed to search your archive"}
            </p>
          ) : !hasArchiveMatches ? (
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No archive matches yet.</p>
          ) : (
            <div className="space-y-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/70">In your library</p>
                {(archiveResults?.library.length ?? 0) > 0 ? (
                  <AnimeGrid
                    items={archiveResults?.library ?? []}
                    entryByAnimeId={entryByAnimeId}
                    onAddToWatchlist={handleAddToWatchlist}
                    onQuickAdd={openEditor}
                  />
                ) : (
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No library matches.</p>
                )}
              </div>

              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/70">In app archive</p>
                {(archiveResults?.archive.length ?? 0) > 0 ? (
                  <AnimeGrid
                    items={archiveResults?.archive ?? []}
                    entryByAnimeId={entryByAnimeId}
                    onAddToWatchlist={handleAddToWatchlist}
                    onQuickAdd={openEditor}
                  />
                ) : (
                  <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No additional archive matches.</p>
                )}
              </div>
            </div>
          )}
        </ResultSection>

        <ResultSection title="AniList" subtitle="External Search">
          {!showAniListSection ? (
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
              Type at least 3 characters for AniList results.
            </p>
          ) : isAniListLoading ? (
            <LoadingGrid />
          ) : isAniListError ? (
            <p className="text-sm font-black uppercase tracking-widest text-destructive">
              {aniListError instanceof Error ? aniListError.message : "AniList search failed"}
            </p>
          ) : !hasAniListMatches ? (
            <p className={cn("text-xs font-black uppercase tracking-widest", hasArchiveMatches ? "text-muted-foreground" : "text-foreground")}>
              {hasArchiveMatches ? "No additional AniList results." : `Nothing found for \"${query}\".`}
            </p>
          ) : (
            <AnimeGrid
              items={dedupedAniList}
              entryByAnimeId={entryByAnimeId}
              onAddToWatchlist={handleAddToWatchlist}
              onQuickAdd={openEditor}
            />
          )}
        </ResultSection>
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
