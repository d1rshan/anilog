"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronRight,
  Star,
  Plus,
  Minus,
  Check,
  Play,
  ListTodo,
  Trash2,
  Ban,
  type LucideIcon,
} from "lucide-react";
import { animate, motion, useMotionValue } from "framer-motion";
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

const STATUS_CONFIG: Record<LibraryStatus, { label: string; icon: LucideIcon }> = {
  watching: { label: "Watching", icon: Play },
  completed: { label: "Completed", icon: Check },
  planned: { label: "Planned", icon: ListTodo },
  dropped: { label: "Dropped", icon: Ban },
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
  const [isMobileSheet, setIsMobileSheet] = useState(false);
  const dragY = useMotionValue(0);

  const title = useMemo(() => anime?.title ?? "Unknown Anime", [anime]);
  const allowedStatuses = useMemo(() => allowedStatusesForAnime(anime?.status), [anime?.status]);
  const isEpisodeRequired = status === "watching" || status === "completed";
  const maxEpisodes = anime?.episodes && anime.episodes > 0 ? anime.episodes : null;
  const minEpisode = isEpisodeRequired ? 1 : 0;
  const isPlanned = status === "planned";

  const episodePercent = useMemo(() => {
    if (!maxEpisodes) return null;
    return Math.max(0, Math.min(100, Math.round(((currentEpisode || 0) / maxEpisodes) * 100)));
  }, [currentEpisode, maxEpisodes]);

  useEffect(() => {
    if (!isOpen) return;

    const nextStatus = initialStatus ?? entry?.status ?? "watching";
    const resolvedStatus = allowedStatuses.includes(nextStatus) ? nextStatus : allowedStatuses[0];

    setStatus(resolvedStatus);
    setCurrentEpisode(entry?.currentEpisode ?? (resolvedStatus === "watching" ? 1 : 0));
    setRating(entry?.rating ?? null);
  }, [isOpen, initialStatus, entry, allowedStatuses]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const apply = () => setIsMobileSheet(media.matches);
    apply();

    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (isOpen) {
      dragY.set(0);
    }
  }, [isOpen, dragY]);

  const handleSubmit = () => {
    if (!anime) return;

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
      return;
    }

    if (newStatus === "planned") {
      setCurrentEpisode(0);
    }
  };

  const updateEpisode = (value: number) => {
    if (status === "completed" && maxEpisodes) return;

    const next = Math.max(minEpisode, Math.min(maxEpisodes ?? Number.POSITIVE_INFINITY, value));
    setCurrentEpisode(next);

    const isFinished = anime?.status?.toUpperCase() === "FINISHED";
    if (isFinished && maxEpisodes && next === maxEpisodes && status !== "completed") {
      setStatus("completed");
    }
  };

  const dismissWithDragAnimation = () => {
    const target = typeof window !== "undefined" ? window.innerHeight * 0.5 : 420;

    animate(dragY, target, {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
      onComplete: () => onOpenChange(false),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "fixed inset-x-0 bottom-0 top-auto left-0 z-50 w-full max-w-none translate-x-0 translate-y-0 border-0 bg-transparent p-0 shadow-none outline-none",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 duration-150",
          "sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:w-full sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2",
        )}
      >
        <motion.div
          style={{ y: dragY }}
          drag={isMobileSheet ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.22 }}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (!isMobileSheet) {
              return;
            }

            if (info.offset.y > 140 || info.velocity.y > 900) {
              dismissWithDragAnimation();
              return;
            }

            animate(dragY, 0, { type: "spring", stiffness: 480, damping: 38, mass: 0.72 });
          }}
          className={cn(
            "flex max-h-[92svh] w-full transform-gpu flex-col overflow-hidden rounded-t-[1.4rem] rounded-b-none border border-white/10 bg-black/55 shadow-2xl backdrop-blur-2xl will-change-transform",
            "sm:max-h-[88svh] sm:rounded-2xl",
          )}
        >
        <div className="relative border-b border-white/10 px-5 pb-4 pt-3 sm:px-8 sm:pb-6 sm:pt-6">
          <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-white/20 sm:hidden" />
          <DialogHeader className="space-y-2 text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-white/40">
              Archive Console
            </p>
            <DialogTitle className="pr-9 font-display text-2xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-4xl">
              {title}
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex flex-1 flex-col overflow-hidden px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pb-7 sm:pt-6">
          <div className="mb-5 grid grid-cols-2 gap-2.5 sm:mb-6 sm:grid-cols-4">
            {allowedStatuses.map((item) => {
              const selected = status === item;
              const Icon = STATUS_CONFIG[item].icon;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => handleStatusChange(item)}
                  className={cn(
                    "relative isolate overflow-hidden rounded-xl border px-3 py-3 transition-all active:scale-[0.99]",
                    selected
                      ? "border-white/35 bg-white text-black"
                      : "border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:bg-white/10",
                  )}
                >
                  <span className="flex items-center justify-center gap-2.5">
                    <Icon className={cn("h-4 w-4", selected ? "text-black" : "text-white/55")} />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      {STATUS_CONFIG[item].label}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
            {isPlanned ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">Watchlist Mode</p>
                  <p className="mt-3 text-sm font-semibold text-white/85">
                    Save this title to your watchlist now. You can switch to watching or completed later.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">Progress</Label>
                      {maxEpisodes && (
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                          {currentEpisode}/{maxEpisodes}
                        </span>
                      )}
                    </div>

                    <div className="mb-4 flex items-center gap-2.5">
                      <button
                        onClick={() => updateEpisode(currentEpisode - 1)}
                        disabled={status === "completed" && !!maxEpisodes}
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all",
                          status === "completed" && maxEpisodes
                            ? "cursor-not-allowed opacity-30"
                            : "hover:border-white/25 hover:bg-white/10 active:scale-95",
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
                            "h-11 border border-white/10 bg-black/35 text-center text-xl font-black text-white focus-visible:ring-1 focus-visible:ring-white/30",
                            status === "completed" && maxEpisodes && "opacity-50",
                          )}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black uppercase tracking-[0.22em] text-white/35">
                          EP
                        </span>
                      </div>

                      <button
                        onClick={() => updateEpisode(currentEpisode + 1)}
                        disabled={status === "completed" && !!maxEpisodes}
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-all",
                          status === "completed" && maxEpisodes
                            ? "cursor-not-allowed opacity-30"
                            : "hover:border-white/25 hover:bg-white/10 active:scale-95",
                        )}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {episodePercent !== null && (
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-white transition-[width] duration-200 ease-out"
                          style={{ width: `${episodePercent}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5">
                    <Label className="mb-4 block text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
                      Rating
                    </Label>
                    <div className="flex h-11 items-center justify-between gap-1 rounded-xl border border-white/10 bg-black/35 px-3.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating((prev) => (prev === star ? null : star))}
                          className="group relative h-8 w-8 transition-transform hover:scale-105 active:scale-95"
                        >
                          <Star
                            className={cn(
                              "h-6 w-6 transition-all duration-250",
                              rating !== null && star <= rating
                                ? "fill-white text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.35)]"
                                : "text-white/12 group-hover:text-white/40",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-3 border-t border-white/10 pt-4 sm:mt-6 sm:flex-row sm:items-center sm:justify-between">
            {entry ? (
              <button
                onClick={handleRemove}
                className="group inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-white/38 transition-colors hover:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Remove Entry</span>
              </button>
            ) : (
              <span className="hidden sm:inline-block" />
            )}

            <Button
              size="lg"
              className="h-12 w-full rounded-full border border-white/20 bg-white px-6 text-[11px] font-black uppercase tracking-[0.24em] text-black transition-all hover:scale-[1.01] hover:bg-white active:scale-95 sm:w-auto"
              onClick={handleSubmit}
              disabled={logAnime.isPending}
            >
              {logAnime.isPending ? "Saving..." : isPlanned ? "Save to Watchlist" : "Save Changes"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
