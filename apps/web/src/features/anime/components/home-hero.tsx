"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { AnimeSearch } from "./anime-search";

const HomeHeroVideo = dynamic(
  () => import("./home-hero-video").then((mod) => mod.HomeHeroVideo),
  {
    ssr: false,
  },
);

interface HomeHeroProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
}

export function HomeHero({ searchValue, onSearchChange }: HomeHeroProps) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadVideo(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative min-h-[88svh] w-full overflow-hidden bg-[#050505] md:min-h-screen">
      {shouldLoadVideo ? (
        <HomeHeroVideo searchValue={searchValue} onSearchChange={onSearchChange} />
      ) : (
        <div className="container relative z-10 mx-auto flex min-h-[88svh] items-center px-4 pt-16 md:min-h-screen md:pt-20">
          <div className="max-w-4xl space-y-8 md:space-y-10">
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-wrap items-center gap-3 md:gap-4">
                <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-white backdrop-blur-md">
                  Monthly Curation
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                  Preparing Stream
                </span>
              </div>
              <h2 className="font-display text-5xl font-black uppercase leading-[0.85] tracking-tighter text-white sm:text-6xl md:text-9xl">
                Discovery
              </h2>
              <p className="max-w-xl text-base font-medium leading-relaxed text-white/60 sm:max-w-2xl md:text-xl">
                Explore what anime fans are logging right now.
              </p>
            </div>
            <div>
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
                Continue Discovery
              </p>
              <AnimeSearch variant="hero" value={searchValue} onChange={onSearchChange} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
