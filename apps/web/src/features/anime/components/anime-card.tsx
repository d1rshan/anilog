import { Plus, Star, Check, Info } from "lucide-react";
import { type Anime } from "@anilog/db/schema/anilog";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AnimeCardProps {
  anime: Pick<Anime, "id" | "title" | "imageUrl" | "year" | "episodes"> & { status?: string | null };
  onAddToList?: (animeId: number) => void;
  onFavorite?: (animeId: number) => void;
  isFavorited?: boolean;
  disabled?: boolean;
  rating?: number | null;
  currentEpisode?: number;
  showActions?: boolean;
  onRemove?: () => void;
}

export function AnimeCard({
  anime,
  onAddToList,
  onFavorite,
  isFavorited,
  disabled,
  rating,
  currentEpisode,
  showActions = true,
  onRemove,
}: AnimeCardProps) {
  return (
    <div className="group relative aspect-[3/4.2] overflow-hidden rounded-2xl bg-muted shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
      {/* POSTER IMAGE */}
      <img
        src={anime.imageUrl}
        alt={anime.title}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.src = `https://via.placeholder.com/300x450?text=${encodeURIComponent(
            anime.title
          )}`;
        }}
      />

      {/* GRADIENT OVERLAY (Always visible but intensifies on hover) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

      {/* TOP BADGES: STATUS & EPISODES */}
      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
        {anime.status && (
          <div className="rounded-full bg-white/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-white backdrop-blur-md ring-1 ring-white/20">
            {anime.status}
          </div>
        )}
        {currentEpisode !== undefined && currentEpisode > 0 && (
          <div className="rounded-full bg-foreground px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-background backdrop-blur-md">
            EP {currentEpisode}
          </div>
        )}
      </div>

      {/* RATING BADGE */}
      {rating && (
        <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[9px] font-black text-black shadow-lg">
          <Star className="h-3 w-3 fill-current" />
          {rating}
        </div>
      )}

      {/* QUICK ICON ACTIONS (Right Side) */}
      {showActions && (
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 flex-col gap-2 opacity-0 transition-all duration-300 translate-x-4 group-hover:translate-x-0 group-hover:opacity-100">
          {onAddToList && (
            <Button
              size="icon"
              variant="secondary"
              className="h-10 w-10 rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-xl hover:bg-white hover:text-black"
              onClick={(e) => {
                e.stopPropagation();
                onAddToList(anime.id);
              }}
              disabled={disabled}
            >
              <Plus className="h-5 w-5" />
            </Button>
          )}
          {onFavorite && (
            <Button
              size="icon"
              variant="secondary"
              className={cn(
                "h-10 w-10 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl transition-colors",
                isFavorited ? "bg-white text-black hover:bg-white/90" : "text-white hover:bg-white hover:text-black"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(anime.id);
              }}
              disabled={disabled}
            >
              <Star className={cn("h-5 w-5", isFavorited && "fill-current")} />
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
            >
              <Plus className="h-5 w-5 rotate-45" />
            </Button>
          )}
        </div>
      )}

      {/* METADATA (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1 transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
        <h3 className="font-display line-clamp-2 text-xl font-bold uppercase leading-none tracking-tight text-white">
          {anime.title}
        </h3>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/60">
          <span>{anime.year}</span>
          <span>•</span>
          <span>{anime.episodes} EPISODES</span>
        </div>
      </div>
    </div>
  );
}