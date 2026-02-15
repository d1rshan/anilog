"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil } from "lucide-react";
import { type Anime, type LibraryStatus } from "@anilog/db/schema/anilog";
import { useTrendingAnime } from "../lib/hooks";
import { useMyLibrary, useLogAnime } from "@/features/lists/lib/hooks";
import { AnimeCard } from "./anime-card";
import { AddToListDialog } from "./add-to-list-dialog";
import { type LibraryEntryWithAnime } from "@/features/lists/lib/requests";
import { toast } from "sonner";
import { useRequireAuth } from "@/features/auth/lib/hooks";
import { cn } from "@/lib/utils";

type DialogState = {
  isOpen: boolean;
  anime: Anime | null;
  initialStatus?: LibraryStatus;
  entry?: LibraryEntryWithAnime | null;
};

interface ScrollRowProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  gap?: string;
  padding?: string;
}

function ScrollRow({ title, subtitle, children, gap = "gap-6", padding = "px-4" }: ScrollRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowLeft(scrollLeft > 20);
    setShowRight(scrollLeft < scrollWidth - clientWidth - 20);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="group/row relative animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="mb-12 flex items-end justify-between border-b border-white/5 pb-8">
        <div className="space-y-2">
          <h2 className="font-display text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl">
            {title}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className={cn(
            "absolute -left-6 top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 transition-all backdrop-blur-2xl hover:scale-110 hover:bg-white hover:text-black group-hover/row:opacity-100 disabled:hidden",
            !showLeft && "hidden"
          )}
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className={cn(
            "no-scrollbar -mx-4 flex overflow-x-hidden overflow-y-hidden pb-8 scroll-smooth",
            gap,
            padding
          )}
        >
          {children}
        </div>

        <button
          onClick={() => scroll("right")}
          className={cn(
            "absolute -right-6 top-1/2 z-50 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white opacity-0 transition-all backdrop-blur-2xl hover:scale-110 hover:bg-white hover:text-black group-hover/row:opacity-100 disabled:hidden",
            !showRight && "hidden"
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
    </section>
  );
}

export function HomeDiscovery() {
  const { data: anime = [], isLoading: isTrendingLoading } = useTrendingAnime();
  const { data: library = [], isLoading: isLibraryLoading } = useMyLibrary();
  const { requireAuth } = useRequireAuth({
    toastMessage: "Please sign in to log anime",
  });
  const logAnime = useLogAnime();

  const [dialog, setDialog] = useState<DialogState>({ isOpen: false, anime: null });

  const watchingEntries = useMemo(
    () => library.filter((entry) => entry.status === "watching"),
    [library]
  );

  const topTen = useMemo(() => anime.slice(0, 10), [anime]);
  const restOfTrending = useMemo(() => anime.slice(10), [anime]);

  const entryByAnimeId = useMemo(
    () => new Map((library ?? []).map((entry) => [entry.animeId, entry])),
    [library]
  );

  const handleAddToWatchlist = (animeItem: Anime) => {
    if (!requireAuth()) {
      return;
    }

    if (entryByAnimeId.has(animeItem.id)) {
      return;
    }

    logAnime.mutate({ anime: animeItem, status: "planned", currentEpisode: 0, rating: null });
    toast.success(`${animeItem.title} added to planned`);
  };

  const openEditor = (target: Anime | LibraryEntryWithAnime) => {
    if (!requireAuth()) {
      return;
    }

    const anime = "anime" in target ? (target.anime as Anime) : target;
    const existingEntry =
      "anime" in target
        ? target
        : (entryByAnimeId.get(target.id) ?? null);

    setDialog({
      isOpen: true,
      anime,
      entry: existingEntry,
      initialStatus: existingEntry?.status ?? "watching",
    });
  };

  if (isTrendingLoading || isLibraryLoading) {
    return (
      <div className="space-y-32">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-12">
            <div className="h-16 w-64 animate-pulse rounded bg-white/5" />
            <div className="flex gap-8 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="aspect-[3/4.2] w-[240px] shrink-0 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-48 pb-48">
      {/* ACTIVE ARCHIVE */}
      {watchingEntries.length > 0 && (
        <ScrollRow title="Active Archive" subtitle="Currently Logging">
          {watchingEntries.map((entry) => (
            <div key={entry.id} className="w-[200px] shrink-0 transition-transform duration-500 hover:z-10 sm:w-[260px]">
              <AnimeCard
                anime={entry.anime}
                currentEpisode={entry.currentEpisode}
                loggedStatus={entry.status}
                actionMode="discovery"
                onQuickAdd={() => openEditor(entry)}
              />
            </div>
          ))}
        </ScrollRow>
      )}

      {/* TOP 10 RANKING */}
      <ScrollRow title="The Canon" subtitle="Global Trending Rankings" gap="gap-32" padding="px-24">
        {topTen.map((animeItem, index) => {
          const entry = entryByAnimeId.get(animeItem.id);
          return (
            <div key={animeItem.id} className="relative flex shrink-0 items-end transition-all duration-500 hover:z-20">
              <span 
                className="pointer-events-none absolute -left-20 bottom-0 z-0 select-none font-display text-[260px] font-black leading-[0.6] text-transparent transition-colors md:text-[320px]"
                style={{ WebkitTextStroke: "2px rgba(255,255,255,0.1)" }}
              >
                {index + 1}
              </span>
            
              <div className="relative z-10 w-[200px] sm:w-[260px]">
                <AnimeCard
                  anime={animeItem}
                  loggedStatus={entry?.status}
                  currentEpisode={entry?.currentEpisode}
                  actionMode="discovery"
                  onQuickAdd={() => openEditor(animeItem)}
                  onAddToWatchlist={() => handleAddToWatchlist(animeItem)}
                />
              </div>
            </div>
          );
        })}
      </ScrollRow>

      {/* COLLECTION GRID */}
      <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="mb-16 flex items-end justify-between border-b border-white/5 pb-8">
          <div className="space-y-2">
            <h2 className="font-display text-6xl font-black uppercase leading-none tracking-tighter md:text-8xl">
              Collection
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/40">
              Curated Discovery
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-24 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {restOfTrending.map((animeItem) => {
            const entry = entryByAnimeId.get(animeItem.id);
            return (
              <div key={animeItem.id} className="transition-transform duration-500 hover:z-10 hover:-translate-y-2">
                <AnimeCard
                  anime={animeItem}
                  loggedStatus={entry?.status}
                  currentEpisode={entry?.currentEpisode}
                  actionMode="discovery"
                  onQuickAdd={() => openEditor(animeItem)}
                  onAddToWatchlist={() => handleAddToWatchlist(animeItem)}
                />
              </div>
            );
          })}
        </div>
      </section>

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
