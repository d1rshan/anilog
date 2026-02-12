"use client";

import { useUserLists } from "../lib/hooks";
import { FolderOpen } from "lucide-react";
import { AnimeCard } from "@/features/anime/components/anime-card";

interface UserListsPublicProps {
  userId: string;
}

export function UserListsPublic({ userId }: UserListsPublicProps) {
  const { data: lists, isLoading } = useUserLists(userId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    );
  }

  if (!lists || lists.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
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
          </div>

          {list.entries.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                This list is empty
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {list.entries.map((entry) => (
                <AnimeCard
                  key={entry.id}
                  anime={entry.anime}
                  rating={entry.rating}
                  currentEpisode={entry.currentEpisode}
                  showActions={false}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
