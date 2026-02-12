"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function AnimeSearch() {
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
        router.push(newUrl as any, { scroll: false });
      }
    },
    [router, searchParams]
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

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        ref={inputRef}
        type="text"
        placeholder="SEARCH ANIME..."
        value={inputValue}
        onChange={handleInputChange}
        className="h-12 border-none bg-muted pl-12 text-sm font-black uppercase tracking-widest focus-visible:ring-1 focus-visible:ring-foreground"
      />
    </div>
  );
}
