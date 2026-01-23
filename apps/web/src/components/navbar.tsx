"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import UserMenu from "@/features/auth/components/user-menu";
import clsx from "clsx";

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { to: "/", label: "Home" },
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


function ModeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
