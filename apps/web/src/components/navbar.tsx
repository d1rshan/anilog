"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";

import { UserMenu } from "@/features/auth/components/user-menu";
import { useAuth } from "@/features/auth/lib/hooks";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const pathname = usePathname();
  const { isAuthenticated, username } = useAuth();

  if (pathname === "/login") return null;
  if (!isAuthenticated || !username) return null;

  const profilePath = `/${username}` as Route;

  type NavLink = {
    href: Route;
    label: string;
    activePath: Route;
  };

  const links: NavLink[] = [
    { href: "/" as Route, label: "Discovery", activePath: "/" as Route },
    { href: "/users" as Route, label: "Community", activePath: "/users" as Route },
    {
      href: profilePath,
      label: "Archive",
      activePath: profilePath,
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6 pointer-events-none">
      <div className="flex items-center justify-between w-full max-w-5xl h-14 px-6 rounded-lg border border-white/10 bg-black/40 backdrop-blur-2xl pointer-events-auto shadow-2xl">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground transition-all duration-300 group-hover:scale-[2]" />
            <span className="font-display text-lg font-black uppercase tracking-tighter">
              Anilog
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 hover:text-foreground relative group/link",
                  pathname === link.activePath ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {link.label}
                <span className={cn(
                  "absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300",
                  pathname === link.activePath ? "w-full" : "w-0 group-hover/link:w-full"
                )} />
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <UserMenu />
        </div>
      </div>
    </nav>
  );
};
