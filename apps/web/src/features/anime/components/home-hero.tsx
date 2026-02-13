"use client";

import { useTrendingAnime } from "../lib/hooks";
import { AnimeSearch } from "./anime-search";
import { Star, Play, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function HomeHero() {
  const { data: anime = [], isLoading } = useTrendingAnime();
  const featured = anime[0];

  if (isLoading) {
    return <Skeleton className="h-[85vh] w-full rounded-none" />;
  }

  if (!featured) return null;

  return (
    <section className="relative h-[90vh] min-h-[700px] w-full overflow-hidden">
      {/* Background Image with Cinematic Effects */}
      <div className="absolute inset-0 z-0">
        <img
          src={featured.bannerImage || featured.imageUrl}
          alt={featured.title}
          className="h-full w-full object-cover transition-transform duration-[10000ms] ease-out scale-110 group-hover:scale-100"
          style={{ animation: "ken-burns 20s ease-in-out infinite alternate" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-80" />
      </div>

      {/* Floating "ANILOG" Title as Background Accent */}
      <div className="pointer-events-none absolute left-[-2vw] top-[15vh] z-10 select-none opacity-[0.03]">
        <h1 className="font-display text-[40vw] font-black uppercase leading-none tracking-tighter text-white">
          Anilog
        </h1>
      </div>

      {/* Main Content Area */}
      <div className="container relative z-20 mx-auto flex h-full flex-col justify-end px-4 pb-24 md:pb-32">
        <div className="max-w-4xl space-y-10">
          {/* Featured Metadata */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md ring-1 ring-white/20">
                <Star className="h-3 w-3 fill-white" />
                <span>{featured.rating ? (featured.rating / 10).toFixed(1) : "N/A"}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">
                #{featured.year} • {featured.status?.replaceAll("_", " ")}
              </span>
            </div>

            <h2 className="font-display text-6xl font-black uppercase leading-[0.9] tracking-tighter md:text-8xl lg:text-9xl">
              {featured.title}
            </h2>

            <p className="line-clamp-3 max-w-2xl text-lg font-medium leading-relaxed text-white/70 md:text-xl">
              {featured.description?.replace(/<[^>]*>?/gm, "")}
            </p>
          </div>

          {/* Large Hero Search */}
          <div className="flex flex-col gap-8 md:flex-row md:items-center">
            <AnimeSearch variant="hero" />
          </div>
        </div>
      </div>

      {/* Subtle Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2 text-white/20">
        <div className="h-12 w-[1px] bg-gradient-to-b from-white to-transparent" />
      </div>

      <style jsx global>{`
        @keyframes ken-burns {
          0% { transform: scale(1) translate(0, 0); }
          100% { transform: scale(1.15) translate(-2%, -2%); }
        }
      `}</style>
    </section>
  );
}
