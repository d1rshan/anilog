import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="aspect-3/4 rounded-lg bg-muted overflow-hidden">
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.src = `https://via.placeholder.com/300x400?text=${encodeURIComponent(anime.title)}`;
            }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <CardTitle className="line-clamp-2 text-lg">{anime.title}</CardTitle>
          {anime.titleJapanese && (
            <p className="text-sm text-muted-foreground mt-1">{anime.titleJapanese}</p>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{anime.year}</span>
          <span>•</span>
          <span>{anime.episodes} ep{anime.episodes !== 1 ? 's' : ''}</span>
          <span>•</span>
          <Badge variant="outline" className="text-xs">{anime.status}</Badge>
        </div>

        {anime.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
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

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onAddToList?.(anime.id)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add to List
          </Button>
          <Button size="sm" variant="outline">
            <Star className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
