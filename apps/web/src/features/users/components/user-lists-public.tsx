"use client";

import { useState } from "react";
import { ChevronUp, FolderOpen } from "lucide-react";
import type { LibraryStatus } from "@anilog/db/schema/anilog";
import { useUserLists } from "../lib/hooks";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "@/features/anime/components/anime-card";
import { LIBRARY_STATUSES } from "@/features/lists/lib/requests";
import { AnimeStackPreview } from "@/features/lists/components/anime-stack-preview";

interface UserListsPublicProps {
  userId: string;
}

const STATUS_LABELS: Record<LibraryStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  planned: "Planned",
  dropped: "Dropped",
};

export function UserListsPublic({ userId }: UserListsPublicProps) {
  const { data: entries, isLoading } = useUserLists(userId);
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
      <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] w-full animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
        <FolderOpen className="mb-4 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          No public library entries found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12 py-6 md:space-y-24 md:py-10">
      {LIBRARY_STATUSES.map((status) => {
        const sectionEntries = entries.filter((entry) => entry.status === status);

        return (
          <section key={status} className="space-y-6 md:space-y-8">
            <div className="flex items-end justify-between border-b border-white/10 pb-4">
              <div className="space-y-1">
                <h3 className="font-display text-3xl font-bold uppercase leading-[0.9] tracking-tight sm:text-4xl md:text-5xl">
                  {STATUS_LABELS[status]}
                </h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                  {sectionEntries.length} Titles
                </p>
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

            {sectionEntries.length === 0 ? (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  No anime in this status
                </p>
              </div>
            ) : !expandedStatuses[status] ? (
              <button
                type="button"
                onClick={() => toggleExpanded(status)}
                className="w-full text-left"
                aria-label={`Expand ${STATUS_LABELS[status]} section`}
              >
                <AnimeStackPreview entries={sectionEntries} />
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
                {sectionEntries.map((entry) => (
                  <div key={entry.id} className="w-full">
                    <AnimeCard
                      anime={entry.anime}
                      rating={entry.rating}
                      currentEpisode={entry.currentEpisode}
                      loggedStatus={entry.status}
                      showActions={false}
                    />
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
