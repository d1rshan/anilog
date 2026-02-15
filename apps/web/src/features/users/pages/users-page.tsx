"use client";

import { UserSearch } from "../components/user-search";

export const UsersPage = () => {
  return (
    <div className="container mx-auto px-4 py-32">
      <div className="mb-24 space-y-4 text-center">
        <h1 className="font-display text-[15vw] font-extrabold uppercase leading-[0.8] tracking-tighter text-foreground mix-blend-difference">
          COMMUNITY
        </h1>
        <p className="mx-auto max-w-xl text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Find and connect with other anime enthusiasts across the globe.
        </p>
      </div>

      <UserSearch />
    </div>
  );
};
