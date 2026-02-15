"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimeSearchProps {
  variant?: "default" | "hero";
}

export function AnimeSearch({ variant = "default" }: AnimeSearchProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // Get search query from URL (single source of truth)
  const urlSearchQuery = searchParams.get("search") || "";

  // Local state for input value (for immediate UI feedback)
  const [inputValue, setInputValue] = useState(urlSearchQuery);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);

  // Sync URL changes to input (for browser back/forward buttons)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Only update input if URL changed externally (not from this component)
    if (document.activeElement !== inputRef.current) {
      setInputValue(urlSearchQuery);
    }
  }, [urlSearchQuery]);

  // Debounced URL update
  const updateUrl = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams);

      if (value.trim()) {
        params.set("search", value.trim());
      } else {
        params.delete("search");
      }

      const newUrl = `?${params.toString()}`;
      const currentUrl = `?${searchParams.toString()}`;

      // Only update if URL actually changed
      if (newUrl !== currentUrl) {
        router.replace(`${pathname}${newUrl}` as Route, { scroll: false });
      }
    },
    [pathname, router, searchParams]
  );

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for URL update
    debounceTimerRef.current = setTimeout(() => {
      updateUrl(newValue);
    }, 300);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const isHero = variant === "hero";

  return (
    <div className={cn("relative w-full", isHero ? "max-w-2xl" : "max-w-md")}>
      <Search className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground", isHero ? "left-6 h-6 w-6" : "left-4 h-4 w-4")} />
      <Input
        ref={inputRef}
        type="text"
        placeholder="SEARCH ANIME..."
        value={inputValue}
        onChange={handleInputChange}
        className={cn(
          "border-none font-black uppercase tracking-[0.2em] focus-visible:ring-1 focus-visible:ring-foreground",
          isHero 
            ? "h-20 bg-white/5 pl-16 text-xl backdrop-blur-xl transition-all hover:bg-white/10" 
            : "h-12 bg-muted pl-12 text-sm tracking-widest"
        )}
      />
    </div>
  );
}
