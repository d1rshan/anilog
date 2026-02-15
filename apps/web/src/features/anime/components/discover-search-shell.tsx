"use client";

import { useMemo, useState } from "react";

import { HomeDiscovery } from "./home-discovery";
import { HomeHero } from "./home-hero";
import { SearchResults } from "./search-results";

export function DiscoverSearchShell() {
  const [query, setQuery] = useState("");
  const normalizedQuery = useMemo(() => query.trim(), [query]);
  const isSearching = normalizedQuery.length >= 2;

  return (
    <div className="flex min-h-screen flex-col">
      <HomeHero searchValue={query} onSearchChange={setQuery} />

      <div className="container mx-auto px-4 pt-8 pb-24 md:pt-12 md:pb-40">
        {isSearching ? <SearchResults query={normalizedQuery} /> : <HomeDiscovery />}
      </div>
    </div>
  );
}
