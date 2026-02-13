"use client";

import { useState } from "react";
import { useUserLists } from "../lib/hooks";
import { FolderOpen, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimeCard } from "@/features/anime/components/anime-card";
import { AnimeStackPreview } from "@/features/lists/components/anime-stack-preview";

interface UserListsPublicProps {
  userId: string;
}

export function UserListsPublic({ userId }: UserListsPublicProps) {
  const { data: lists, isLoading } = useUserLists(userId);
  const [expandedLists, setExpandedLists] = useState<Record<string, boolean>>(
    {},
  );

  const toggleExpanded = (listId: string) => {
    setExpandedLists((prev) => ({
      ...prev,
      [listId]: !prev[listId],
    }));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="w-full aspect-[2/3] animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
        <FolderOpen className="mb-4 h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
          No public lists found
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-24 py-10">
      {lists.map((list) => (
        <div key={list.id} className="space-y-8">
          <div className="flex items-end justify-between border-b border-white/10 pb-4">
            <div className="space-y-1">
              <h3 className="font-display text-5xl font-bold uppercase tracking-tight leading-[0.9]">
                {list.name}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                {list.entries.length} TITLES
              </p>
            </div>
            {expandedLists[list.id] && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-bold uppercase tracking-widest"
                onClick={() => toggleExpanded(list.id)}
              >
                Collapse
                <ChevronUp className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {list.entries.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                This list is empty
              </p>
            </div>
          ) : !expandedLists[list.id] ? (
            <button
              type="button"
              onClick={() => toggleExpanded(list.id)}
              className="w-full text-left"
              aria-label={`Expand ${list.name} list`}
            >
              <AnimeStackPreview entries={list.entries} />
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {list.entries.map((entry) => (
                <div key={entry.id} className="w-full">
                  <AnimeCard
                    anime={entry.anime}
                    rating={entry.rating}
                    currentEpisode={entry.currentEpisode}
                    showActions={false}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
