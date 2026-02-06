"use client";

import { usePathname, useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import UserMenu from "@/features/auth/components/user-menu";
import { useSession } from "@/features/auth/lib/hooks";
import clsx from "clsx";

const links = [
  { to: "/", label: "Home" },
  { to: "/users", label: "Users" },
  { to: "/profile", label: "My Lists" },
] as const;

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Don't show navbar on login page
  if (pathname === "/login") {
    return null;
  }

  // Don't show navbar if user is not authenticated
  if (!session) {
    return null;
  }

  return (
    <header className="fixed top-4 left-1/2 z-50 -translate-x-1/2">
      <div
        className="flex items-center justify-between gap-2 rounded-full border border-border bg-card/70 px-4 py-2 backdrop-blur-lg shadow-lg"
      >
        <nav className="flex items-center gap-1">
          {links.map(({ to, label }) => {
            const isActive = pathname === to;

            return (
              <button
                key={to}
                onClick={() => router.push(to as Parameters<typeof router.push>[0])}
                className={clsx(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition",
                  isActive && "bg-foreground text-background"
                )}
              >
                {label}
              </button>
            );
          })}

          <UserMenu />
          <ModeToggle />
        </nav>
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
      className="relative rounded-full"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
    </Button>
  );
}
