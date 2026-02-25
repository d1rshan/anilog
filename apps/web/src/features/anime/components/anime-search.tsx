"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimeSearchProps {
  variant?: "default" | "hero" | "dock";
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function AnimeSearch({
  variant = "default",
  value,
  onChange,
  placeholder = "SEARCH ANIME...",
  autoFocus = false,
}: AnimeSearchProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = typeof value === "string";
  const inputValue = useMemo(
    () => (isControlled ? value : internalValue),
    [internalValue, isControlled, value],
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const isHero = variant === "hero";
  const isDock = variant === "dock";

  return (
    <div
      className={cn(
        "relative w-full",
        isHero ? "max-w-full md:max-w-2xl" : "max-w-full md:max-w-md",
        isDock && "md:max-w-full",
      )}
    >
      <Search
        className={cn(
          "absolute top-1/2 -translate-y-1/2 text-muted-foreground",
          isHero ? "left-4 h-5 w-5 md:left-6 md:h-6 md:w-6" : "left-4 h-4 w-4",
          isDock && "text-white/45",
        )}
      />
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        autoFocus={autoFocus}
        className={cn(
          "font-black uppercase",
          isHero
            ? "h-14 border-none bg-white/5 pl-12 text-sm tracking-[0.16em] backdrop-blur-xl transition-all md:h-20 md:pl-16 md:text-xl md:tracking-[0.2em] md:hover:bg-white/10 focus-visible:ring-1 focus-visible:ring-white/40"
            : "h-12 bg-muted pl-12 text-sm tracking-[0.16em] md:tracking-widest",
          isDock &&
            "h-12 border-white/10 bg-white/5 pl-12 text-sm tracking-[0.18em] text-white placeholder:text-white/35 focus-visible:border-white/20 focus-visible:ring-2 focus-visible:ring-white/12",
          !isHero && !isDock && "border-none focus-visible:ring-1 focus-visible:ring-foreground",
        )}
      />
    </div>
  );
}
