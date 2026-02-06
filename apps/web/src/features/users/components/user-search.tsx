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
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 h-12 text-lg"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {!showResults && searchQuery.length > 0 && (
        <p className="text-center text-muted-foreground">
          Type at least 3 characters to search...
        </p>
      )}

      {showResults && (
        <>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : isError ? (
            <p className="text-center text-destructive">
              Error searching users. Please try again.
            </p>
          ) : !hasResults ? (
            <p className="text-center text-muted-foreground py-8">
              No users found matching &quot;{debouncedQuery}&quot;
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
