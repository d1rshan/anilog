import { Check, ListTodo, Pencil, Plus, Play, X } from "lucide-react";
import { type Anime, type LibraryStatus } from "@anilog/db/schema/anilog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AnimeCardProps {
  anime: Pick<Anime, "id" | "title" | "imageUrl" | "year" | "episodes"> & { status?: string | null };
  disabled?: boolean;
  rating?: number | null;
  currentEpisode?: number;
  showActions?: boolean;
  onRemove?: () => void;
  loggedStatus?: LibraryStatus;
  onPlan?: (animeId: number) => void;
  onStartWatching?: (animeId: number) => void;
  onIncrementEpisode?: (animeId: number) => void;
  onOpenEditor?: (animeId: number) => void;
  onComplete?: (animeId: number) => void;
}

const STATUS_LABELS: Record<LibraryStatus, string> = {
  watching: "Watching",
  completed: "Completed",
  planned: "Planned",
  dropped: "Dropped",
};

export function AnimeCard({
  anime,
  disabled,
  rating,
  currentEpisode,
  showActions = true,
  onRemove,
  loggedStatus,
  onPlan,
  onStartWatching,
  onIncrementEpisode,
  onOpenEditor,
  onComplete,
}: AnimeCardProps) {
  const progressPercent =
    loggedStatus === "watching" && anime.episodes && anime.episodes > 0
      ? Math.min(100, Math.round(((currentEpisode ?? 0) / anime.episodes) * 100))
      : null;

  return (
    <div className="group relative aspect-[3/4.2] overflow-hidden rounded-lg bg-muted shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
      <img
        src={anime.imageUrl}
        alt={anime.title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.src = `https://via.placeholder.com/300x450?text=${encodeURIComponent(anime.title)}`;
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
        {anime.status && (
          <div className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md ring-1 ring-white/20">
            {anime.status}
          </div>
        )}
        {loggedStatus && (
          <div className="rounded-full bg-foreground px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-background backdrop-blur-md">
            {STATUS_LABELS[loggedStatus]}
          </div>
        )}
        {currentEpisode !== undefined && currentEpisode > 0 && (
          <div className="rounded-full bg-white px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-black backdrop-blur-md">
            EP {currentEpisode}
          </div>
        )}
      </div>

      {rating && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-black shadow-lg">
          <span>{rating}/5</span>
        </div>
      )}

      {showActions && (
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
        {progressPercent !== null && (
          <div className="space-y-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/20">
              <div className="h-full bg-white" style={{ width: `${progressPercent}%` }} />
            </div>
            <p className="text-[9px] font-bold uppercase tracking-widest text-white/70">{progressPercent}% complete</p>
          </div>
        )}
      </div>
    </div>
  );
}
