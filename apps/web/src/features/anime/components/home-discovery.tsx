"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Pencil } from "lucide-react";
import { type Anime, type LibraryStatus } from "@anilog/db/schema/anilog";
import { useTrendingAnime } from "../lib/hooks";
import { useMyLibrary } from "@/features/lists/lib/hooks";
import { AnimeCard } from "./anime-card";
import { AddToListDialog } from "./add-to-list-dialog";
import { type LibraryEntryWithAnime } from "@/features/lists/lib/requests";
import { toast } from "sonner";
import { useSession } from "@/features/auth/lib/hooks";
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
    <section className="group/row relative space-y-10">
      <div className="flex items-end justify-between border-b border-white/5 pb-6">
        <div className="space-y-1">
          <h2 className="font-display text-5xl font-black uppercase leading-none tracking-tighter">
            {title}
          </h2>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40">
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
            "no-scrollbar -mx-4 flex overflow-x-hidden overflow-y-hidden pb-4 scroll-smooth",
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
  const { data: session } = useSession();

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

  const openEditor = (animeItem: any) => {
    if (!session?.user?.id) {
      toast.error("Please sign in to log anime");
      return;
    }

    setDialog({
      isOpen: true,
      anime: animeItem as Anime,
      entry: entryByAnimeId.get(animeItem.id) ?? null,
      initialStatus: entryByAnimeId.get(animeItem.id)?.status ?? "watching",
    });
  };

  if (isTrendingLoading || isLibraryLoading) {
    return (
      <div className="space-y-16">
        {[1, 2].map((i) => (
          <div key={i} className="space-y-8">
            <div className="h-10 w-48 animate-pulse rounded bg-white/5" />
            <div className="flex gap-6 overflow-hidden">
              {[1, 2, 3, 4, 5, 6].map((j) => (
                <div key={j} className="aspect-[3/4.2] w-[200px] shrink-0 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-32 pb-32">
      {/* ACTIVE ARCHIVE */}
      {watchingEntries.length > 0 && (
        <ScrollRow title="Active Archive" subtitle="In-Progress Logs">
          {watchingEntries.map((entry) => (
            <div key={entry.id} className="w-[180px] shrink-0 sm:w-[220px]">
              <AnimeCard
                anime={entry.anime as any}
                currentEpisode={entry.currentEpisode}
                loggedStatus={entry.status}
                actionMode="discovery"
                onQuickAdd={() => openEditor(entry.anime)}
              />
            </div>
          ))}
        </ScrollRow>
      )}

      {/* TOP 10 RANKING */}
      <ScrollRow title="The Canon" subtitle="Global Top 10" gap="gap-24" padding="px-20">
        {topTen.map((animeItem, index) => {
          const entry = entryByAnimeId.get(animeItem.id);
          return (
                            <div key={animeItem.id} className="relative flex shrink-0 items-end transition-all duration-500 hover:z-20">
                              <span 
                                className="pointer-events-none absolute -left-16 bottom-0 z-0 select-none font-display text-[220px] font-black leading-[0.65] text-transparent transition-colors md:text-[280px]"
                                style={{ WebkitTextStroke: "2px rgba(255,255,255,0.15)" }}
                              >
                                {index + 1}
                              </span>
            
              <div className="relative z-10 w-[180px] sm:w-[220px]">
                <AnimeCard
                  anime={animeItem}
                  loggedStatus={entry?.status}
                  currentEpisode={entry?.currentEpisode}
                  actionMode="discovery"
                  onQuickAdd={() => openEditor(animeItem)}
                />
              </div>
            </div>
          );
        })}
      </ScrollRow>

      {/* COLLECTION GRID */}
      <section className="space-y-16">
        <div className="flex items-end justify-between border-b border-white/5 pb-6">
          <div className="space-y-1">
            <h2 className="font-display text-5xl font-black uppercase leading-none tracking-tighter">
              Collection
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/50">
              Trending Discovery
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-16 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {restOfTrending.map((animeItem) => {
            const entry = entryByAnimeId.get(animeItem.id);
            return (
              <div key={animeItem.id} className="transition-transform duration-500 hover:z-10">
                <AnimeCard
                  anime={animeItem}
                  loggedStatus={entry?.status}
                  currentEpisode={entry?.currentEpisode}
                  actionMode="discovery"
                  onQuickAdd={() => openEditor(animeItem)}
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
