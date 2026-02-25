"use client";

import { useState } from "react";
import { AnimeCard } from "@/features/anime/components/anime-card";

type StackEntry = {
  id: string;
  status: "watching" | "completed" | "planned" | "dropped";
  currentEpisode?: number | null;
  rating?: number | null;
  anime: {
    id: number;
    title: string;
    titleJapanese?: string | null;
    imageUrl: string;
    year: number | null;
    episodes: number | null;
    status?: string | null;
  };
};

interface AnimeStackPreviewProps {
  entries: StackEntry[];
  maxVisible?: number;
}

export function AnimeStackPreview({ entries, maxVisible = 6 }: AnimeStackPreviewProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const isStackExpanded = hoveredIndex !== null;
  const visibleEntries = entries.slice(0, maxVisible);
  const remaining = Math.max(entries.length - visibleEntries.length, 0);

  return (
    <div className="relative overflow-x-auto pb-2">
      <div className="flex min-h-[14rem] items-end px-2 py-2">
        {visibleEntries.map((entry, index) => (
          <div
            key={entry.id}
            className="w-[13rem] shrink-0 transition-[margin-left,transform] duration-300"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex((current) => (current === index ? null : current))}
            style={{
              zIndex:
                hoveredIndex === index ? visibleEntries.length + 20 : visibleEntries.length - index,
              marginLeft: index === 0 ? "0" : isStackExpanded ? "-4.25rem" : "-5rem",
            }}
          >
            <div className="origin-bottom transition-transform duration-300 hover:-translate-y-2">
              <AnimeCard
                anime={entry.anime}
                rating={entry.rating}
                currentEpisode={entry.currentEpisode ?? undefined}
                loggedStatus={entry.status}
                showActions={false}
              />
            </div>
          </div>
        ))}

        {remaining > 0 && (
          <div className="ml-3 shrink-0 rounded-lg border border-border/70 bg-background/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-sm">
            +{remaining} More
          </div>
        )}
      </div>
    </div>
  );
}
