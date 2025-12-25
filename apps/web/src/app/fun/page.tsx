"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useState } from "react";


type AnimeItem = {
  id: string;
  title: { english: string; native: string; };
  episodes: number;
  coverImage: { large: string; color: string; }
}

export default function Home() {
  const [input, setInput] = useState("");
  const [anime, setAnime] = useState<AnimeItem[]>([]);


  const fetchAnime = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/anime/search/${input}`);
      const data = await response.json();

      if (data.success) {
        setAnime(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch anime');
      }
    } catch (err) {
      throw new Error('Failed to fetch anime');
    }
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Anilog</h1>
        <p className="text-lg text-muted-foreground">
          Discover, track, and rate your favorite anime
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Popular Anime</h2>
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} className="w-fit" placeholder="Browse anime" />
          <Button onClick={fetchAnime}>Search</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {anime.map((item) => <AnimeCard key={item.id} title={item.title} episodes={item.episodes} coverImage={item.coverImage} />)}
      </div>
    </div>
  );
}


interface AnimeCardProps {
  title: { english: string; native: string; };
  episodes: number;
  coverImage: { large: string; color: string; }
}

const AnimeCard = ({
  title,
  episodes,
  coverImage,
}: AnimeCardProps) => {
  return (
    <Card className="group overflow-hidden rounded-xl border-none shadow-md hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm">
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={coverImage.large}
          alt={`${title.english || title.native} cover`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Dynamic gradient overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        />

        {/* Episode count badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1">
          <span className="text-xs font-medium text-white">
            {episodes ? `${episodes} eps` : "Ongoing"}
          </span>
        </div>

        {/* Color accent */}
        <div
          className="absolute bottom-0 left-0 w-full h-1 opacity-80"
          style={{ backgroundColor: coverImage.color || '#6366f1' }}
        />
      </div>

      {/* Content */}
      <CardContent className="p-4">
        <h3 className="font-bold text-sm leading-tight line-clamp-2 mb-2 text-gray-900 group-hover:text-gray-600 transition-colors">
          {title.english || title.native}
        </h3>

        {/* Rating/Action area */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-gray-200"></div>
            ))}
          </div>
          <div
            className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm"
            style={{ backgroundColor: coverImage.color || '#6366f1' }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
