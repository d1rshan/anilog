"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";
import clsx from "clsx";

export default function Header() {
  const pathname = usePathname();

  const links = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/profile", label: "My Lists" },
  ] as const;

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <div
        className="
          flex items-center justify-between gap-2
          rounded-full border border-border
        bg-card/70
          px-4 py-2
          backdrop-blur-lg
          shadow-lg
        "
      >
        <nav className="flex items-center gap-1">
          {links.map(({ to, label }) => {
            const isActive = pathname === to;

            return (
              <Link
                key={to}
                href={to}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition",
                  isActive &&
                  "bg-foreground text-background"
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
