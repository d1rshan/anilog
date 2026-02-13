"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Star, Plus, Minus, Trash2, Check, Play, ListTodo, X } from "lucide-react";
import type { Anime, LibraryStatus } from "@anilog/db/schema/anilog";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LIBRARY_STATUSES, type LibraryEntryWithAnime } from "@/features/lists/lib/requests";
import { useLogAnime, useRemoveFromLibrary } from "@/features/lists/lib/hooks";

interface AddToListDialogProps {
  anime: Anime | null;
  entry?: LibraryEntryWithAnime | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialStatus?: LibraryStatus;
}

const STATUS_CONFIG: Record<LibraryStatus, { label: string; icon: any; color: string }> = {
  watching: { label: "Watching", icon: Play, color: "bg-white text-black" },
  completed: { label: "Completed", icon: Check, color: "bg-emerald-500 text-white" },
  planned: { label: "Planned", icon: ListTodo, color: "bg-blue-500 text-white" },
  dropped: { label: "Dropped", icon: X, color: "bg-rose-500 text-white" },
};

function allowedStatusesForAnime(animeStatus?: string | null): LibraryStatus[] {
  const status = (animeStatus ?? "").toUpperCase();

  if (status === "NOT_YET_RELEASED") {
    return ["planned"];
  }

  if (status === "RELEASING") {
    return ["watching", "planned", "dropped"];
  }

  return [...LIBRARY_STATUSES];
}

export function AddToListDialog({ anime, entry, isOpen, onOpenChange, initialStatus }: AddToListDialogProps) {
  const logAnime = useLogAnime();
  const removeAnime = useRemoveFromLibrary();
  const [status, setStatus] = useState<LibraryStatus>(initialStatus ?? "watching");
  const [currentEpisode, setCurrentEpisode] = useState<number>(entry?.currentEpisode ?? 0);
  const [rating, setRating] = useState<number | null>(entry?.rating ?? null);

  const title = useMemo(() => anime?.title ?? "Unknown Anime", [anime]);
  const allowedStatuses = useMemo(() => allowedStatusesForAnime(anime?.status), [anime?.status]);
  const isEpisodeRequired = status === "watching" || status === "completed";
  const maxEpisodes = anime?.episodes && anime.episodes > 0 ? anime.episodes : null;
  const minEpisode = isEpisodeRequired ? 1 : 0;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const nextStatus = initialStatus ?? entry?.status ?? "watching";
    const resolvedStatus = allowedStatuses.includes(nextStatus) ? nextStatus : allowedStatuses[0];

    setStatus(resolvedStatus);
    setCurrentEpisode(entry?.currentEpisode ?? (resolvedStatus === "watching" ? 1 : 0));
    setRating(entry?.rating ?? null);
  }, [isOpen, initialStatus, entry, allowedStatuses]);

  const handleSubmit = () => {
    if (!anime) {
      return;
    }

    const resolvedEpisode =
      status === "completed" && anime.episodes && anime.episodes > 0
        ? anime.episodes
        : Math.max(
            minEpisode,
            Math.min(maxEpisodes ?? Number.POSITIVE_INFINITY, Math.trunc(currentEpisode || 0)),
          );

    logAnime.mutate(
      {
        anime,
        status,
        currentEpisode: resolvedEpisode,
        rating,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  const handleRemove = () => {
    if (!anime) return;
    removeAnime.mutate(anime.id, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const handleStatusChange = (newStatus: LibraryStatus) => {
    setStatus(newStatus);
    if (newStatus === "completed" && maxEpisodes) {
      setCurrentEpisode(maxEpisodes);
    }
  };

  const updateEpisode = (val: number) => {
    if (status === "completed" && maxEpisodes) return;

    const next = Math.max(minEpisode, Math.min(maxEpisodes ?? Number.POSITIVE_INFINITY, val));
    setCurrentEpisode(next);

    // Auto-complete logic: If series is finished and max episodes reached, switch to completed
    const isFinished = anime?.status?.toUpperCase() === "FINISHED";
    if (isFinished && maxEpisodes && next === maxEpisodes && status !== "completed") {
      setStatus("completed");
    }
  };

  const isPlanned = status === "planned";

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg overflow-hidden border-white/5 bg-[#0a0a0a] p-0 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]">
        <div className="relative border-b border-white/5 p-8">
          <DialogHeader className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60">
              {isPlanned ? "Watchlist" : "Manage Log"}
            </p>
            <DialogTitle className="font-display text-4xl font-bold uppercase leading-none tracking-tight">
              {title}
            </DialogTitle>
          </DialogHeader>
          {entry && !isPlanned && (
            <button
              onClick={handleRemove}
              className="absolute right-8 top-1/2 -translate-y-1/2 rounded-full border border-rose-500/20 bg-rose-500/10 p-2.5 text-rose-500 transition-all hover:bg-rose-500 hover:text-white"
              title="Remove from Library"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-10 p-8">
          {/* STATUS SELECTOR */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              {isPlanned ? "Start Tracking" : "Log Status"}
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {allowedStatuses
                .filter((s) => s !== "planned" || allowedStatuses.length === 1)
                .map((item) => {
                  const selected = status === item;
                  const config = STATUS_CONFIG[item];
                  const Icon = config.icon;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleStatusChange(item)}
                      className={cn(
                        "group flex flex-col items-center gap-3 rounded-xl border border-white/5 bg-white/5 py-4 transition-all duration-300",
                        selected ? "border-white bg-white text-black" : "hover:border-white/20 hover:bg-white/10",
                      )}
                    >
                      <Icon
                        className={cn("h-5 w-5", selected ? "text-black" : "text-muted-foreground group-hover:text-white")}
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest">{config.label}</span>
                    </button>
                  );
                })}
            </div>
          </div>

          {!isPlanned ? (
            <>
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
                {/* EPISODE CONTROLS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                      Progress
                    </Label>
                    {maxEpisodes && (
                      <span className="text-[10px] font-bold text-muted-foreground/40">OF {maxEpisodes}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateEpisode(currentEpisode - 1)}
                      disabled={status === "completed" && !!maxEpisodes}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-white/5 transition-all",
                        status === "completed" && maxEpisodes ? "cursor-not-allowed opacity-30" : "hover:bg-white/10 active:scale-95",
                      )}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="relative flex-1">
                      <Input
                        type="number"
                        value={currentEpisode}
                        disabled={status === "completed" && !!maxEpisodes}
                        onChange={(e) => updateEpisode(Number.parseInt(e.target.value) || 0)}
                        className={cn(
                          "h-12 border-none bg-white/5 text-center text-xl font-black focus-visible:ring-1 focus-visible:ring-white/20",
                          status === "completed" && maxEpisodes && "opacity-50",
                        )}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase text-muted-foreground/40">
                        EP
                      </span>
                    </div>
                    <button
                      onClick={() => updateEpisode(currentEpisode + 1)}
                      disabled={status === "completed" && !!maxEpisodes}
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-xl border border-white/5 bg-white/5 transition-all",
                        status === "completed" && maxEpisodes ? "cursor-not-allowed opacity-30" : "hover:bg-white/10 active:scale-95",
                      )}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* RATING CONTROLS */}
                <div className="space-y-4">
                  <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Rating</Label>
                  <div className="flex h-12 items-center justify-between gap-1 rounded-xl bg-white/5 px-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating((prev) => (prev === star ? null : star))}
                        className="group relative h-8 w-8 transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={cn(
                            "h-6 w-6 transition-all duration-300",
                            rating !== null && star <= rating
                              ? "fill-white text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                              : "text-white/10 group-hover:text-white/30",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="h-16 w-full rounded-full bg-white text-sm font-black uppercase tracking-[0.2em] text-black transition-all hover:scale-[1.02] hover:bg-white active:scale-95"
                onClick={handleSubmit}
                disabled={logAnime.isPending}
              >
                {logAnime.isPending ? "Syncing..." : "Update Archive"}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="h-16 w-full rounded-full border-rose-500/10 bg-rose-500/5 text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 transition-all hover:border-rose-500 hover:bg-rose-500 hover:text-white"
              onClick={handleRemove}
            >
              Remove from Watchlist
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
