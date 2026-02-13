"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronRight, Star } from "lucide-react";
import type { Anime, LibraryStatus } from "@anilog/db/schema/anilog";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LIBRARY_STATUSES, type LibraryEntryWithAnime } from "@/features/lists/lib/requests";
import { useLogAnime } from "@/features/lists/lib/hooks";

interface AddToListDialogProps {
  anime: Anime | null;
  entry?: LibraryEntryWithAnime | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  initialStatus?: LibraryStatus;
}

const STATUS_LABELS: Record<LibraryStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  planned: "Planned",
  dropped: "Dropped",
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
  const [status, setStatus] = useState<LibraryStatus>(initialStatus ?? "watching");
  const [currentEpisode, setCurrentEpisode] = useState<number>(entry?.currentEpisode ?? 0);
  const [rating, setRating] = useState<number | null>(entry?.rating ?? null);

  const title = useMemo(() => anime?.title ?? "Unknown Anime", [anime]);
  const allowedStatuses = useMemo(() => allowedStatusesForAnime(anime?.status), [anime?.status]);
  const isEpisodeRequired = status === "watching" || status === "completed";
  const maxEpisodes = anime?.episodes && anime.episodes > 0 ? anime.episodes : null;
  const minEpisode = isEpisodeRequired ? 1 : 0;
  const isEpisodeWithinBounds =
    !isEpisodeRequired ||
    (currentEpisode >= minEpisode && (maxEpisodes === null || currentEpisode <= maxEpisodes));

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

  const canSubmit = !!anime && isEpisodeWithinBounds;

  const helperText = useMemo(() => {
    if (status === "watching") {
      return "Episode is required for Watching.";
    }

    if (status === "completed") {
      return "Completed requires final watched episode.";
    }

    if (maxEpisodes !== null) {
      return `Max ${maxEpisodes} episodes.`;
    }

    return "";
  }, [status, maxEpisodes]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-none p-0 shadow-2xl">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-black uppercase tracking-tight">Log Anime</DialogTitle>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{title}</p>
        </DialogHeader>

        <div className="flex flex-col gap-6 p-6">
          <div className="grid grid-cols-1 gap-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Status</Label>
            <div className="flex flex-wrap gap-2">
              {LIBRARY_STATUSES.map((item) => {
                const selected = status === item;
                const disabled = !allowedStatuses.includes(item);

                return (
                  <button
                    key={item}
                    type="button"
                    disabled={disabled}
                    onClick={() => setStatus(item)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-xs font-bold transition-all",
                      selected ? "border-foreground bg-foreground text-background" : "bg-background hover:border-foreground",
                      disabled && "cursor-not-allowed opacity-40",
                    )}
                  >
                    {STATUS_LABELS[item]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="episode" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Current Episode
              </Label>
              <div className="relative">
                <Input
                  id="episode"
                  type="number"
                  min={isEpisodeRequired ? "1" : "0"}
                  max={maxEpisodes !== null ? String(maxEpisodes) : undefined}
                  className="h-12 border-none bg-muted text-lg font-bold focus-visible:ring-1 focus-visible:ring-foreground"
                  value={currentEpisode}
                  onChange={(e) => {
                    const nextValue = Number(e.target.value);
                    if (!Number.isFinite(nextValue)) {
                      setCurrentEpisode(minEpisode);
                      return;
                    }

                    const floored = Math.trunc(nextValue);
                    const clamped = Math.max(minEpisode, Math.min(maxEpisodes ?? Number.POSITIVE_INFINITY, floored));
                    setCurrentEpisode(clamped);
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-muted-foreground">EP</span>
              </div>
              {helperText ? <p className="text-[10px] font-medium text-muted-foreground">{helperText}</p> : null}
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Your Rating</Label>
              <div className="flex h-12 items-center justify-center gap-1 rounded-md bg-muted px-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating((prev) => (prev === star ? null : star))}
                    className="group transition-transform hover:scale-110 active:scale-95"
                  >
                    <Star
                      className={cn(
                        "size-5 transition-colors",
                        rating !== null && star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground/30 hover:text-muted-foreground",
                      )}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <Button
            size="lg"
            className="h-14 w-full text-sm font-black uppercase tracking-widest transition-all hover:scale-[1.02]"
            onClick={handleSubmit}
            disabled={logAnime.isPending || !canSubmit}
          >
            {logAnime.isPending ? "Logging..." : "Save Log"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
