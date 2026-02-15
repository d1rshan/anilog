"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimeSearchProps {
  variant?: "default" | "hero";
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export function AnimeSearch({ variant = "default", value, onChange, placeholder = "SEARCH ANIME..." }: AnimeSearchProps) {
  const [internalValue, setInternalValue] = useState("");
  const isControlled = typeof value === "string";
  const inputValue = useMemo(() => (isControlled ? value : internalValue), [internalValue, isControlled, value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const isHero = variant === "hero";

  return (
    <div className={cn("relative w-full", isHero ? "max-w-full md:max-w-2xl" : "max-w-full md:max-w-md")}>
      <Search className={cn("absolute top-1/2 -translate-y-1/2 text-muted-foreground", isHero ? "left-4 h-5 w-5 md:left-6 md:h-6 md:w-6" : "left-4 h-4 w-4")} />
      <Input
        type="text"
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        className={cn(
          "border-none font-black uppercase focus-visible:ring-1 focus-visible:ring-foreground",
          isHero 
            ? "h-14 bg-white/5 pl-12 text-sm tracking-[0.16em] backdrop-blur-xl transition-all md:h-20 md:pl-16 md:text-xl md:tracking-[0.2em] md:hover:bg-white/10"
            : "h-12 bg-muted pl-12 text-sm tracking-[0.16em] md:tracking-widest"
        )}
      />
    </div>
  );
}
