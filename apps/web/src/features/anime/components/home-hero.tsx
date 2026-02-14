"use client";

import { useState, useRef, useEffect } from "react";
import YouTube, { type YouTubeProps, YouTubePlayer } from "react-youtube";
import { AnimeSearch } from "./anime-search";
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// --- MONTHLY CURATION CONFIG ---
const CURATIONS = [
  {
    videoId: "cszyD9FxsP0",
    start: 0,
    stop: 60, // Plays for 28 seconds when unmuted
    title: "ONE PIECE",
    subtitle: "Egghead Arc Selection",
    description: "Witness the pinnacle of modern animation as the Straw Hats reach the island of the future and the truth of the world begins to unravel.",
    tag: "Series Spotlight"
  },
  {
    videoId: "GrLh_7ykWRk",
    start: 140,
    stop: 177,
    title: "Jujutsu Kaisen",
    subtitle: "Visual Poetry",
    description: "Exploring the hyper-realistic backgrounds, emotional lighting, and cosmic scales that have made Makoto Shinkai a global phenomenon.",
    tag: "Director Focus"
  }
];

export function HomeHero() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const playerRef = useRef<YouTubePlayer | null>(null);

  const current = CURATIONS[currentIndex];

  // --- AUTO-CYCLE LOGIC ---
  // If muted: Auto-cycle every 15s.
  // If unmuted: Disable auto-cycle (let the video play to 'stop' time).
  useEffect(() => {
    if (!isMuted) return; // Stop the timer if audio is on

    const interval = setInterval(() => {
      handleNext();
    }, 15000);
    return () => clearInterval(interval);
  }, [currentIndex, isMuted]);

  const handleNext = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % CURATIONS.length);
      setIsTransitioning(false);
    }, 600);
  };

  const handlePrev = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + CURATIONS.length) % CURATIONS.length);
      setIsTransitioning(false);
    }, 600);
  };

  // --- AUDIO CONTROL ---
  const toggleMute = () => {
    if (!playerRef.current) return;
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);

    if (newMutedState) {
      playerRef.current.mute();
    } else {
      playerRef.current.unMute();
      playerRef.current.setVolume(100);
      // Optional: Reset to start when unmute to ensure full experience?
      // playerRef.current.seekTo(current.start); 
    }
  };

  // --- PLAYER EVENTS ---
  const onPlayerReady = (event: { target: YouTubePlayer }) => {
    playerRef.current = event.target;
    if (isMuted) {
      event.target.mute();
    } else {
      event.target.unMute();
      event.target.setVolume(100);
    }
  };

  // Check play progress to enforce 'stop' time
  const onStateChange = (event: { target: YouTubePlayer; data: number }) => {
    // 0 = Ended (Standard YouTube end)
    if (event.data === 0 && !isMuted) {
      handleNext();
    }
  };

  // While playing, check if we passed the 'stop' timestamp
  useEffect(() => {
    if (isMuted || !playerRef.current) return;

    const checkTime = setInterval(async () => {
      try {
        const currentTime = await playerRef.current.getCurrentTime();
        if (currentTime >= current.stop) {
          handleNext();
        }
      } catch (e) {
        // Player might not be ready yet
      }
    }, 1000);

    return () => clearInterval(checkTime);
  }, [currentIndex, isMuted, current.stop]);

  // YouTube Options
  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
      showinfo: 0,
      mute: 1,
      loop: 1,
      start: current.start,
      end: current.stop, // Native YouTube 'end' param (hard cut)
      playlist: current.videoId,
      modestbranding: 1,
      iv_load_policy: 3,
    },
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-[#050505]">
      {/* 1. YouTube Background Layer */}
      <div className={cn(
        "absolute inset-0 z-0 scale-[1.15] origin-center transition-all duration-1000",
        isTransitioning ? "opacity-0 scale-125" : "opacity-100 scale-110"
      )}>
        <div className="relative h-full w-full pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh]">
            <YouTube
              videoId={current.videoId}
              opts={opts}
              onReady={onPlayerReady}
              onStateChange={onStateChange}
              className="h-full w-full"
              iframeClassName="h-full w-full pointer-events-none"
            />
          </div>
        </div>

        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-[#050505]/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-80" />
      </div>

      {/* 2. Editorial Content Overlay */}
      <div className="container relative z-20 mx-auto flex h-full items-center px-4 pt-20">
        <div className="max-w-4xl space-y-10">

          <div className={cn(
            "space-y-6 transition-all duration-700 ease-out",
            isTransitioning ? "opacity-0 -translate-y-8" : "opacity-100 translate-y-0"
          )}>
            <div className="flex items-center gap-4">
              <span className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-white backdrop-blur-md">
                {current.tag}
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                {current.subtitle}
              </span>
            </div>

            <h2 className="font-display text-7xl font-black uppercase leading-[0.85] tracking-tighter text-white md:text-9xl">
              {current.title}
            </h2>

            <p className="max-w-2xl text-lg font-medium leading-relaxed text-white/60 md:text-xl">
              {current.description}
            </p>
          </div>

          <div className={cn(
            "transition-all duration-1000 delay-300",
            isTransitioning ? "opacity-0" : "opacity-100"
          )}>
            <p className="mb-4 text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Continue Discovery</p>
            <AnimeSearch variant="hero" />
          </div>
        </div>
      </div>

      {/* 3. Interactive Controls */}
      <div className="absolute bottom-12 right-12 z-30 flex items-center gap-8">
        <div className="hidden items-center gap-3 md:flex">
          {CURATIONS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                if (idx === currentIndex) return;
                setIsTransitioning(true);
                setTimeout(() => {
                  setCurrentIndex(idx);
                  setIsTransitioning(false);
                }, 600);
              }}
              className={cn(
                "h-1 rounded-full transition-all duration-500",
                idx === currentIndex ? "w-16 bg-white" : "w-4 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-2xl transition-all hover:bg-white hover:text-black active:scale-90"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleNext}
            className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-2xl transition-all hover:bg-white hover:text-black active:scale-90"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <button
          onClick={toggleMute}
          className="group flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-2xl transition-all hover:bg-white hover:text-black active:scale-90 shadow-2xl"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="h-5 w-5 transition-transform group-hover:scale-110" /> : <Volume2 className="h-5 w-5 transition-transform group-hover:scale-110" />}
        </button>
      </div>

      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/40 to-transparent z-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent z-40 pointer-events-none" />
    </section>
  );
}
