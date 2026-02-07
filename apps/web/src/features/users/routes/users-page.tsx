"use client";

import { Users } from "lucide-react";
import { UserSearch } from "../components/user-search";

export function UsersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Discover Users</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find and connect with other anime enthusiasts. Search by name to discover new profiles.
        </p>
      </div>

      <UserSearch />
    </div>
  );
}
