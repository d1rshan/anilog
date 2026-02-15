"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { UserMenu } from "@/features/auth/components/user-menu";
import { useAuth } from "@/features/auth/lib/hooks";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, username, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuShellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!menuShellRef.current) {
        return;
      }
      if (!menuShellRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [mobileMenuOpen]);

  if (pathname === "/login") return null;
  if (!isAuthenticated || !username || !user) return null;

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
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-[1.5px] transition-opacity duration-500 md:hidden",
          mobileMenuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
      />
      <nav className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center p-3 md:p-6">
        <div
          ref={menuShellRef}
          className="pointer-events-auto relative flex h-12 w-full max-w-5xl items-center justify-between rounded-lg border border-white/10 bg-black/55 px-3 shadow-2xl backdrop-blur-2xl md:h-14 md:px-6"
        >
        <div className="flex items-center gap-4 md:gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-1.5 w-1.5 rounded-full bg-foreground transition-all duration-300 group-hover:scale-[2]" />
            <span className="font-display text-base font-black uppercase tracking-tighter md:text-lg">
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-all duration-500 active:scale-95 md:hidden",
              mobileMenuOpen
                ? "bg-white/10 text-white"
                : "bg-transparent"
            )}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
            aria-label="Toggle navigation menu"
          >
            <span
              className={cn(
                "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
                mobileMenuOpen ? "rotate-90" : "rotate-0"
              )}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </span>
          </button>
          <div className="hidden md:ml-1 md:block">
            <UserMenu />
          </div>
        </div>

        <div
          id="mobile-nav-menu"
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+0.55rem)] origin-top overflow-hidden rounded-lg border border-white/10 bg-black/55 p-2 shadow-2xl backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] md:hidden",
            mobileMenuOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-[0.96] opacity-0"
          )}
        >
          <div className="relative space-y-1.5">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "group block rounded-md px-3 py-2.5 text-[10px] font-black uppercase tracking-[0.24em] transition-all duration-300",
                  pathname === link.activePath
                    ? "bg-white/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
              >
                <span className="inline-flex items-center gap-2">
                  <span className={cn(
                    "h-1 w-1 rounded-full transition-colors",
                    pathname === link.activePath ? "bg-foreground" : "bg-white/35 group-hover:bg-foreground/80"
                  )} />
                  {link.label}
                </span>
              </Link>
            ))}
            <div className="my-1 h-px bg-white/10" />
            <button
              type="button"
              onClick={() => {
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login");
                    },
                  },
                });
              }}
              className="group flex w-full items-center justify-between rounded-md border border-white/10 bg-black/20 px-3 py-2.5 text-left transition-all duration-300 hover:bg-white/10"
            >
              <span className="min-w-0">
                <span className="block truncate text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
                  {user.name}
                </span>
                <span className="block truncate text-[10px] font-bold text-muted-foreground/70">
                  {user.email}
                </span>
              </span>
              <span className="ml-3 inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-destructive">
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </span>
            </button>
          </div>
        </div>
      </div>
      </nav>
    </>
  );
};
