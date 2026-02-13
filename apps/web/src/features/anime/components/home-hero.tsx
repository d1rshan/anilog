"use client";

import { useEffect, useState, useMemo } from "react";
import { useTrendingAnime } from "../lib/hooks";
import { AnimeSearch } from "./anime-search";
import { Star, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export function HomeHero() {
  const { data: anime = [], isLoading } = useTrendingAnime();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Find top 5 anime that have banners for the rotation
  const featuredList = useMemo(() => {
    const withBanners = anime.filter(a => !!a.bannerImage).slice(0, 5);
    // Fallback if not enough banners: just take top 5
    return withBanners.length > 0 ? withBanners : anime.slice(0, 5);
  }, [anime]);

  useEffect(() => {
    if (featuredList.length <= 1) return;

    const interval = setInterval(() => {
      handleNext();
    }, 8000); // 8 seconds per slide

    return () => clearInterval(interval);
  }, [featuredList.length, currentIndex]);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredList.length);
      setIsTransitioning(false);
    }, 500);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + featuredList.length) % featuredList.length);
      setIsTransitioning(false);
    }, 500);
  };

  if (isLoading) {
    return <Skeleton className="h-[75vh] w-full rounded-none bg-white/5" />;
  }

  const featured = featuredList[currentIndex];
  if (!featured) return null;

  const hasBanner = !!featured.bannerImage;

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden bg-[#050505]">
      {/* Background Layers for Smooth Transitions */}
      {featuredList.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "absolute inset-0 z-10 transition-all duration-1000 ease-in-out",
            index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-110 pointer-events-none"
          )}
        >
          {/* Cinema Scope Container */}
          <div className={cn(
            "absolute inset-0 flex items-center justify-center overflow-hidden",
            hasBanner ? "h-[75%] top-0" : "h-full"
          )}>
            <img
              src={item.bannerImage || item.imageUrl}
              alt=""
              className={cn(
                "h-full w-full object-cover",
                !item.bannerImage && "blur-xl opacity-30 scale-150"
              )}
              style={{ 
                objectPosition: "50% 35%",
                animation: index === currentIndex ? "ken-burns 30s ease-in-out infinite alternate" : undefined
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-[#050505]/20" />
          </div>
        </div>
      ))}

      {/* Floating "ANILOG" Background Text */}
      <div className="pointer-events-none absolute left-[-2vw] top-[5vh] z-0 select-none opacity-[0.02]">
        <h1 className="font-display text-[35vw] font-black uppercase leading-none tracking-tighter text-white">
          Anilog
        </h1>
      </div>

      {/* Static Overlays: Controls & Content */}
      <div className="container relative z-30 mx-auto flex h-full flex-col justify-end px-4 pb-16 md:pb-24">
        <div className="max-w-4xl space-y-10">
          
          {/* Content with its own transition state */}
          <div className={cn(
            "space-y-6 transition-all duration-500",
            isTransitioning ? "opacity-0 -translate-x-4" : "opacity-100 translate-x-0"
          )}>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white backdrop-blur-md ring-1 ring-white/20">
                <Star className="h-3 w-3 fill-white" />
                <span>{featured.rating ? (featured.rating / 10).toFixed(1) : "N/A"}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50">
                TOP TRENDING • {featured.year} • {featured.genres?.slice(0, 2).join(" / ")}
              </span>
            </div>

            <h2 className="font-display text-5xl font-black uppercase leading-[0.85] tracking-tighter md:text-7xl lg:text-8xl">
              {featured.title}
            </h2>

            <p className="line-clamp-2 max-w-2xl text-base font-medium leading-relaxed text-white/60 md:text-lg">
              {featured.description?.replace(/<[^>]*>?/gm, "")}
            </p>
          </div>

          <div className="flex flex-col gap-12 md:flex-row md:items-center">
            <AnimeSearch variant="hero" />
            
            {/* Slide Indicators */}
            <div className="flex items-center gap-3">
              {featuredList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setCurrentIndex(idx);
                      setIsTransitioning(false);
                    }, 500);
                  }}
                  className={cn(
                    "h-1 transition-all duration-500 rounded-full",
                    idx === currentIndex ? "w-12 bg-white" : "w-4 bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Navigation Arrows */}
      <div className="absolute right-8 bottom-24 z-40 hidden flex-col gap-4 md:flex">
        <button 
          onClick={handlePrev}
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
        >
          <ChevronLeft className="h-5 w-5 transition-transform group-active:scale-90" />
        </button>
        <button 
          onClick={handleNext}
          className="group flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-black/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-black"
        >
          <ChevronRight className="h-5 w-5 transition-transform group-active:scale-90" />
        </button>
      </div>

      <style jsx global>{`
        @keyframes ken-burns {
          0% { transform: scale(1.05) translate(0, 0); }
          100% { transform: scale(1.15) translate(-1%, -1%); }
        }
      `}</style>
    </section>
  );
}
