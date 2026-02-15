"use client";

import { useMemo, useState } from "react";
import { ChevronUp, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "@/features/anime/components/anime-card";
import { AddToListDialog } from "@/features/anime/components/add-to-list-dialog";
import { AnimeStackPreview } from "./anime-stack-preview";
import {
  useMyLibrary,
  groupLibraryByStatus,
} from "../lib/hooks";
import { LIBRARY_STATUSES, type LibraryEntryWithAnime } from "../lib/requests";
import type { LibraryStatus, Anime } from "@anilog/db/schema/anilog";

const STATUS_LABELS: Record<LibraryStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  planned: "Planned",
  dropped: "Dropped",
};

type DialogState = {
  isOpen: boolean;
  anime: Anime | null;
  initialStatus?: LibraryStatus;
  entry?: LibraryEntryWithAnime | null;
};

export function EditableLists() {
  const { data: library, isLoading } = useMyLibrary();
  
  const grouped = groupLibraryByStatus(library);
  const [expandedStatuses, setExpandedStatuses] = useState<Record<LibraryStatus, boolean>>({
    watching: false,
    completed: false,
    planned: false,
    dropped: false,
  });

  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, anime: null });

  const toggleExpanded = (status: LibraryStatus) => {
    setExpandedStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  const openEditor = (entry: LibraryEntryWithAnime) => {
    setDialog({
      isOpen: true,
      anime: entry.anime as unknown as Anime,
      entry: entry,
      initialStatus: entry.status,
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] w-full animate-pulse rounded-md bg-muted" />
        ))}
      </div>
    );
  }

  if (!library || library.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
        <FolderOpen className="mb-4 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Start logging anime to build your library</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-6 md:space-y-20 md:py-10">
      {LIBRARY_STATUSES.map((status) => {
        const entries = grouped[status];

        return (
          <section key={status} className="space-y-6 md:space-y-8">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <h3 className="font-display text-3xl font-bold uppercase leading-[0.9] tracking-tight sm:text-4xl md:text-5xl">{STATUS_LABELS[status]}</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{entries.length} Titles</p>
              </div>
              {expandedStatuses[status] && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest"
                  onClick={() => toggleExpanded(status)}
                >
                  Collapse
                  <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {entries.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-md border border-dashed border-border text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">No anime logged in this status</p>
              </div>
            ) : !expandedStatuses[status] ? (
              <button
                type="button"
                onClick={() => toggleExpanded(status)}
                className="w-full text-left"
                aria-label={`Expand ${STATUS_LABELS[status]} section`}
              >
                <AnimeStackPreview entries={entries} />
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
                {entries.map((entry) => (
                  <div key={entry.id} className="w-full">
                    <AnimeCard
                      anime={entry.anime}
                      rating={entry.rating}
                      currentEpisode={entry.currentEpisode}
                      loggedStatus={entry.status}
                      actionMode="discovery"
                      onQuickAdd={() => openEditor(entry)}
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <AddToListDialog
        anime={dialog.anime}
        entry={dialog.entry}
        initialStatus={dialog.initialStatus}
        isOpen={dialog.isOpen}
        onOpenChange={(open) => setDialog((prev) => ({ ...prev, isOpen: open }))}
      />
    </div>
  );
}
