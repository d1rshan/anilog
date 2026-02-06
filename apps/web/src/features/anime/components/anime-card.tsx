import { Plus, Star } from "lucide-react";
import { type Anime } from "@anilog/db/schema/anilog";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { cn } from "@/lib/utils";

interface AnimeCardProps {
  anime: Anime;
  onAddToList?: (animeId: number) => void;
  onFavorite?: (animeId: number) => void;
  isFavorited?: boolean;
  disabled?: boolean;
}

export function AnimeCard({ anime, onAddToList, onFavorite, isFavorited, disabled }: AnimeCardProps) {
  const genres = anime.genres || [];

  return (
    <Card>
      {/* IMAGE */}
      <CardHeader>
        <div className="aspect-3/4 overflow-hidden rounded-lg">
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = `https://via.placeholder.com/300x400?text=${encodeURIComponent(
                anime.title
              )}`;
            }}
          />
        </div>
        <CardTitle className="line-clamp-2 text-lg">
          {anime.title}
        </CardTitle>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="flex flex-1 flex-col gap-2">

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{anime.year}</span>
          <span>•</span>
          <span>
            {anime.episodes} ep{anime.episodes !== 1 ? "s" : ""}
          </span>
          <span>•</span>
          <Badge className="text-xs">
            {anime.status}
          </Badge>
        </div>

        {anime.description && (
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {anime.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1">
          {genres.slice(0, 3).map((genre: string, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {genre}
            </Badge>
          ))}
          {genres.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{genres.length - 3}
            </Badge>
          )}
        </div>
      </CardContent>

      {/* FOOTER (ALWAYS BOTTOM) */}
      <CardFooter className="mt-auto flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => onAddToList?.(anime.id)}
          disabled={disabled}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add to List
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onFavorite?.(anime.id)}
          disabled={disabled}
          className={cn(
            "transition-colors",
            isFavorited && "text-yellow-500 border-yellow-500 hover:text-yellow-500 hover:border-yellow-500"
          )}
        >
          <Star className={cn("h-4 w-4", isFavorited && "fill-current")} />
        </Button>
      </CardFooter>
    </Card>
  );
}
