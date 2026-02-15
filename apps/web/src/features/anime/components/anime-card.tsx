import { Check, ListTodo, Pencil, Plus, Play, Star, X, Ban } from "lucide-react";
import Image from "next/image";
import { type Anime, type LibraryStatus } from "@anilog/db/schema/anilog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AnimeCardProps {
  anime: Pick<Anime, "id" | "title" | "imageUrl" | "year" | "episodes"> & { status?: string | null };
  disabled?: boolean;
  rating?: number | null;
  currentEpisode?: number;
  showActions?: boolean;
  actionMode?: "default" | "discovery";
  showLoggedStatusBadge?: boolean;
  onAddToWatchlist?: (animeId: number) => void;
  onQuickAdd?: (animeId: number) => void;
  onRemove?: () => void;
  loggedStatus?: LibraryStatus;
  onPlan?: (animeId: number) => void;
  onStartWatching?: (animeId: number) => void;
  onIncrementEpisode?: (animeId: number) => void;
  onOpenEditor?: (animeId: number) => void;
  onComplete?: (animeId: number) => void;
}

export function AnimeCard({
  anime,
  disabled,
  rating,
  currentEpisode,
  showActions = true,
  actionMode = "default",
  showLoggedStatusBadge = true,
  onAddToWatchlist,
  onQuickAdd,
  onRemove,
  loggedStatus,
  onPlan,
  onStartWatching,
  onIncrementEpisode,
  onOpenEditor,
  onComplete,
}: AnimeCardProps) {
  const normalizedAnimeStatus = anime.status?.toLowerCase().replaceAll("_", " ");
  const isReleasing = normalizedAnimeStatus === "releasing";
  const isFinished = normalizedAnimeStatus === "finished";
  const showBroadcastStatusPill = isReleasing || isFinished;

  const watchingProgressPercent =
    loggedStatus === "watching" && anime.episodes && anime.episodes > 0
      ? Math.min(100, Math.round(((currentEpisode ?? 0) / anime.episodes) * 100))
      : null;
  const droppedProgressPercent =
    loggedStatus === "dropped" && anime.episodes && anime.episodes > 0
      ? Math.min(100, Math.round(((currentEpisode ?? 0) / anime.episodes) * 100))
      : 0;
  const statusBadgeProgressPercent = (() => {
    if (!loggedStatus) {
      return 0;
    }

    if (loggedStatus === "watching") {
      return watchingProgressPercent ?? 0;
    }

    if (loggedStatus === "completed") {
      return 100;
    }

    if (loggedStatus === "dropped") {
      return droppedProgressPercent;
    }

    return 0;
  })();
  const showLibraryStatusBadge = showLoggedStatusBadge && !!loggedStatus;

  const circleSize = 34;
  const strokeWidth = 3.25;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const statusBadgeDashOffset = circumference - (statusBadgeProgressPercent / 100) * circumference;

  const canShowWatchlistButton = !loggedStatus;

  return (
    <div className="group relative aspect-[3/4.2] overflow-hidden rounded-lg bg-muted shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
      <Image
        src={anime.imageUrl}
        alt={anime.title}
        fill
        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
        className="object-cover transition-transform duration-700 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        {anime.status && (
          <>
            {showBroadcastStatusPill ? (
              <div
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-white backdrop-blur-md ring-1",
                  isReleasing ? "bg-white/12 ring-white/30" : "bg-white/8 ring-white/20 text-white/85",
                )}
                title={isReleasing ? "Currently releasing" : "Release finished"}
                aria-label={isReleasing ? "Currently releasing" : "Release finished"}
              >
                {isReleasing ? (
                  <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                    <span className="absolute inline-flex h-2.5 w-2.5 animate-ping rounded-full bg-white/65" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                  </span>
                ) : (
                  <span className="relative inline-flex h-2.5 w-2.5 items-center justify-center">
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white/75" />
                  </span>
                )}
              </div>
            ) : (
              <div className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md ring-1 ring-white/20">
                {anime.status}
              </div>
            )}
          </>
        )}
      </div>

      <div className="absolute right-3 top-3 flex flex-col items-end gap-1.5">
        {showLibraryStatusBadge && (
          <div className="flex items-center justify-end gap-1.5">
            {showLibraryStatusBadge && (
              <div
                className="relative h-8.5 w-8.5 shrink-0 rounded-full bg-black/60 backdrop-blur-md ring-1 ring-white/25"
                aria-label={
                  loggedStatus === "watching"
                    ? `Episode ${currentEpisode ?? 0}, ${statusBadgeProgressPercent}% complete`
                    : loggedStatus === "completed"
                      ? "Completed"
                      : loggedStatus === "dropped"
                        ? `${statusBadgeProgressPercent}% watched before dropping`
                        : "Planned"
                }
                title={
                  loggedStatus === "watching"
                    ? `${statusBadgeProgressPercent}% complete`
                    : loggedStatus === "completed"
                      ? "Completed"
                      : loggedStatus === "dropped"
                        ? `${statusBadgeProgressPercent}% watched`
                        : "Planned"
                }
              >
                <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox={`0 0 ${circleSize} ${circleSize}`} aria-hidden="true">
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.22)"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="white"
                    strokeLinecap="round"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={statusBadgeDashOffset}
                  />
                </svg>
                {loggedStatus === "watching" ? (
                  <div className="relative flex h-full w-full flex-col items-center justify-center text-white">
                    <span className="text-[9px] font-black leading-none">{currentEpisode ?? 0}</span>
                    <span className="text-[6px] font-bold uppercase tracking-wide text-white/75">EP</span>
                  </div>
                ) : (
                  <div className="relative flex h-full w-full items-center justify-center text-white">
                    {loggedStatus === "planned" && <ListTodo className="h-3.5 w-3.5" />}
                    {loggedStatus === "completed" && <Check className="h-3.5 w-3.5" />}
                    {loggedStatus === "dropped" && <Ban className="h-3.5 w-3.5" />}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showActions && actionMode === "discovery" && (
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 translate-x-4 flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          {canShowWatchlistButton && (
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl hover:bg-white hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                onAddToWatchlist?.(anime.id);
              }}
              disabled={disabled}
              title="Add to Watchlist"
            >
              <ListTodo className="h-5 w-5" />
            </Button>
          )}
          <Button
            size="icon"
            variant="secondary"
            className={cn(
              "h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl hover:bg-white hover:text-black",
              loggedStatus && "bg-white text-black",
            )}
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd?.(anime.id);
            }}
            disabled={disabled}
            title={loggedStatus ? "Edit Log" : "Open Quick Add"}
          >
            {loggedStatus ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </Button>
        </div>
      )}

      {showActions && actionMode === "default" && (
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 translate-x-4 flex-col gap-2 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
          {onPlan && !loggedStatus && (
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl hover:bg-white hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                onPlan(anime.id);
              }}
              disabled={disabled}
              title="Add to Planned"
            >
              <ListTodo className="h-5 w-5" />
            </Button>
          )}

          {onStartWatching && (loggedStatus === "planned" || loggedStatus === "dropped" || !loggedStatus) && (
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl hover:bg-white hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                onStartWatching(anime.id);
              }}
              disabled={disabled}
              title="Start Watching"
            >
              <Play className="h-5 w-5" />
            </Button>
          )}

          {onIncrementEpisode && loggedStatus === "watching" && (
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full border border-white/10 bg-white text-black backdrop-blur-xl hover:bg-white/90"
              onClick={(e) => {
                e.stopPropagation();
                onIncrementEpisode(anime.id);
              }}
              disabled={disabled}
              title="Next Episode"
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}

          {onComplete && loggedStatus === "watching" && (
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl hover:bg-white hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                onComplete(anime.id);
              }}
              disabled={disabled}
              title="Mark Completed"
            >
              <Check className="h-5 w-5" />
            </Button>
          )}

          {onOpenEditor && (
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl hover:bg-white hover:text-black",
                loggedStatus && "bg-white text-black",
              )}
              onClick={(e) => {
                e.stopPropagation();
                onOpenEditor(anime.id);
              }}
              disabled={disabled}
              title="Edit Log"
            >
              <Pencil className="h-5 w-5" />
            </Button>
          )}

          {onRemove && (
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl hover:bg-white hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              disabled={disabled}
              title="Remove"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 translate-y-2 space-y-2 p-5 transition-transform duration-500 group-hover:translate-y-0">
        <h3 className="font-display line-clamp-2 text-xl font-bold uppercase leading-none tracking-tight text-white">{anime.title}</h3>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
          <span>{anime.year}</span>
          <span>•</span>
          <span>{anime.episodes} Episodes</span>
        </div>
      </div>
    </div>
  );
}
