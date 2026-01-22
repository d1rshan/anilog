import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Plus, Star } from "lucide-react";
import { type Anime } from "@anilog/db/schema/anime";

interface AnimeCardProps {
  anime: Anime;
  onAddToList?: (animeId: number) => void;
}

export function AnimeCard({ anime, onAddToList }: AnimeCardProps) {
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
        >
          <Plus className="mr-2 h-4 w-4" />
          Add to List
        </Button>
        <Button size="sm" variant="outline">
          <Star className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
