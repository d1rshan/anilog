"use client";

import { useState } from "react";
import { ChevronUp, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "@/features/anime/components/anime-card";
import { AnimeStackPreview } from "./anime-stack-preview";
import { useMyLibrary, useRemoveFromLibrary, useUpdateLibraryProgress, groupLibraryByStatus } from "../lib/hooks";
import { LIBRARY_STATUSES } from "../lib/requests";
import type { LibraryStatus } from "@anilog/db/schema/anilog";

const STATUS_LABELS: Record<LibraryStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  planned: "Planned",
  dropped: "Dropped",
};

export function EditableLists() {
  const { data: library, isLoading } = useMyLibrary();
  const removeFromLibrary = useRemoveFromLibrary();
  const updateProgress = useUpdateLibraryProgress();
  const grouped = groupLibraryByStatus(library);
  const [expandedStatuses, setExpandedStatuses] = useState<Record<LibraryStatus, boolean>>({
    watching: false,
    completed: false,
    planned: false,
    dropped: false,
  });

  const toggleExpanded = (status: LibraryStatus) => {
    setExpandedStatuses((prev) => ({
      ...prev,
      [status]: !prev[status],
    }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
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
    <div className="space-y-20 py-10">
      {LIBRARY_STATUSES.map((status) => {
        const entries = grouped[status];

        return (
          <section key={status} className="space-y-8">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <h3 className="font-display text-5xl font-bold uppercase leading-[0.9] tracking-tight">{STATUS_LABELS[status]}</h3>
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
              <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {entries.map((entry) => (
                  <div key={entry.id} className="w-full">
                    <AnimeCard
                      anime={entry.anime}
                      rating={entry.rating}
                      currentEpisode={entry.currentEpisode}
                      loggedStatus={entry.status}
                      onRemove={() => removeFromLibrary.mutate(entry.animeId)}
                    />
                    {status === "watching" && (
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
                          onClick={() =>
                            updateProgress.mutate({
                              animeId: entry.animeId,
                              currentEpisode: Math.max(1, entry.currentEpisode - 1),
                            })
                          }
                        >
                          -1 Ep
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
                          onClick={() => updateProgress.mutate({ animeId: entry.animeId, delta: 1 })}
                        >
                          +1 Ep
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
