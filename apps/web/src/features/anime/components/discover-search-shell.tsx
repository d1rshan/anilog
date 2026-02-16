"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";
import { HomeDiscovery } from "./home-discovery";
import { HomeHero } from "./home-hero";
import { SearchResults } from "./search-results";
import { AnimeSearch } from "./anime-search";

export function DiscoverSearchShell() {
  const [query, setQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const normalizedQuery = useMemo(() => query.trim(), [query]);
  const isSearching = normalizedQuery.length >= 2;
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const focusDockInput = useCallback(() => {
    requestAnimationFrame(() => {
      const input = dockRef.current?.querySelector("input");
      input?.focus();
    });
  }, []);

  const openSearchMode = useCallback(() => {
    setIsSearchMode(true);
    focusDockInput();
  }, [focusDockInput]);

  const closeSearchMode = useCallback(() => {
    setIsSearchMode(false);
    setQuery("");
  }, []);

  const handleSearchChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim().length > 0) {
      setIsSearchMode(true);
    }
  }, []);

  useEffect(() => {
    if (!isSearchMode) {
      return;
    }
    focusDockInput();
  }, [focusDockInput, isSearchMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearchMode();
        return;
      }

      if (event.key === "Escape" && isSearchMode) {
        event.preventDefault();
        closeSearchMode();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeSearchMode, isSearchMode, openSearchMode]);

  useEffect(() => {
    const onOpenSearch = () => {
      openSearchMode();
    };

    window.addEventListener("anilog:open-search", onOpenSearch);
    return () => window.removeEventListener("anilog:open-search", onOpenSearch);
  }, [openSearchMode]);

  useEffect(() => {
    const shouldOpenFromNavigation = sessionStorage.getItem("anilog:open-search") === "1";
    if (shouldOpenFromNavigation) {
      sessionStorage.removeItem("anilog:open-search");
      openSearchMode();
    }
  }, [openSearchMode]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("anilog:search-state", {
        detail: { active: isSearchMode },
      }),
    );

    return () => {
      window.dispatchEvent(
        new CustomEvent("anilog:search-state", {
          detail: { active: false },
        }),
      );
    };
  }, [isSearchMode]);

  if (isSearchMode) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <div className="container mx-auto px-4 pb-24 pt-40 md:pb-32 md:pt-44">
          {isSearching ? (
            <SearchResults query={normalizedQuery} />
          ) : (
            <div className="rounded-2xl border border-white/10 bg-black/45 p-8 text-center backdrop-blur-2xl md:p-12">
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-white/45">Search Workspace</p>
              <p className="mt-3 text-sm font-semibold text-white/75 md:text-base">
                Start typing at least 2 characters to see live results.
              </p>
            </div>
          )}
        </div>

        {isClient &&
          createPortal(
            <div className="pointer-events-none fixed inset-x-0 top-0 z-[70] py-3 md:py-6">
              <div className="container mx-auto px-4">
                <div
                  ref={dockRef}
                  className="pointer-events-auto w-full rounded-xl border border-white/10 bg-black/55 p-3 shadow-2xl backdrop-blur-2xl md:p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">Live Search</p>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 rounded-full border border-white/15 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/80 hover:border-white/25 hover:bg-white/12 hover:text-white"
                        onClick={closeSearchMode}
                      >
                        <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                        Back
                      </Button>
                      <span className="inline-flex h-8 items-center rounded-full border border-white/12 bg-white/6 px-3 text-[10px] font-black uppercase tracking-[0.18em] text-white/65">
                        Esc
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full border border-white/15 text-white/80 hover:border-white/25 hover:bg-white/12 hover:text-white"
                        onClick={() => setQuery("")}
                        aria-label="Clear search"
                        title="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <AnimeSearch value={query} onChange={handleSearchChange} placeholder="SEARCH ANIME..." autoFocus variant="dock" />
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <HomeHero searchValue={query} onSearchChange={handleSearchChange} />

      <div className="container mx-auto px-4 pt-8 pb-24 md:pt-12 md:pb-40">
        <HomeDiscovery />
      </div>
    </div>
  );
}
