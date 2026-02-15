import { headers } from "next/headers";

import { requireCurrentUser } from "@/features/auth/lib/server";
import { UserSearch } from "../components/user-search";

export const UsersPage = async () => {
  await requireCurrentUser(await headers());

  return (
    <div className="container mx-auto px-4 pb-20 pt-24 md:py-32">
      <div className="mb-12 space-y-4 text-center md:mb-24">
        <h1 className="font-display text-5xl font-extrabold uppercase leading-[0.8] tracking-tighter text-foreground sm:text-7xl md:text-[15vw]">
          COMMUNITY
        </h1>
        <p className="mx-auto max-w-xl text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground md:tracking-[0.3em]">
          Find and connect with other anime enthusiasts across the globe.
        </p>
      </div>

      <UserSearch />
    </div>
  );
};
