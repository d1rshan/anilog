"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { useSearchUsers } from "../lib/hooks";
import { UserCard } from "./user-card";
import { Skeleton } from "@/components/ui/skeleton";

export function UserSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: users, isLoading, isError } = useSearchUsers(debouncedQuery);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const showResults = debouncedQuery.length >= 3;
  const hasResults = users && users.length > 0;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="SEARCH USERS..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="h-12 border-none bg-muted pl-12 text-sm font-black uppercase tracking-[0.15em] focus-visible:ring-1 focus-visible:ring-foreground md:h-14 md:tracking-widest"
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {!showResults && searchQuery.length > 0 && (
        <p className="text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Type at least 3 characters...
        </p>
      )}

      {showResults && (
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-center text-xs font-bold uppercase text-destructive">
              Error searching users.
            </p>
          ) : !hasResults ? (
            <p className="py-12 text-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
              No results for &quot;{debouncedQuery}&quot;
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
