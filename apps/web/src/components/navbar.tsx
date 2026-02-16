"use client";

import { useEffect, useRef, useState } from "react";
import { LogOut, ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";

import { UserMenu } from "@/features/auth/components/user-menu";
import { useAuth } from "@/features/auth/lib/hooks";
import { authClient } from "@/lib/auth-client";
import { useRouteTransition } from "@/lib/route-transition";
import { cn } from "@/lib/utils";

const Hamburger = ({ isOpen, onClick }: { isOpen: boolean; onClick: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md text-white transition-all duration-500 active:scale-95 md:hidden",
        isOpen ? "bg-white/10" : "bg-transparent"
      )}
      aria-expanded={isOpen}
      aria-controls="mobile-nav-menu"
      aria-label="Toggle navigation menu"
    >
      <span
        className={cn(
          "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "rotate-90" : "rotate-0"
        )}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </span>
    </button>
  );
};

export const Navbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, username, user } = useAuth();
  const { startNavigation } = useRouteTransition();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [optimisticPath, setOptimisticPath] = useState<string | null>(null);
  const menuShellRef = useRef<HTMLDivElement | null>(null);
  const profilePath = username ? (`/${username}` as Route) : null;

  useEffect(() => {
    setMobileMenuOpen(false);
    setOptimisticPath(null);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuShellRef.current?.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onEscape);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    router.prefetch("/");
    router.prefetch("/users");

    if (profilePath) {
      router.prefetch(profilePath);
    }
  }, [router, profilePath]);

  if (pathname === "/login") return null;
  if (!isAuthenticated || !username || !user) return null;
  const userProfilePath = `/${username}` as Route;
  const activePath = optimisticPath ?? pathname;

  const links = [
    { href: "/" as Route, label: "Discovery", activePath: "/" as Route },
    { href: "/users" as Route, label: "Community", activePath: "/users" as Route },
    { href: userProfilePath, label: "Archive", activePath: userProfilePath },
  ];

  const handleNavClick = (targetPath: string) => {
    setOptimisticPath(targetPath);
    startNavigation(targetPath);
  };

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 flex justify-center p-3 md:p-6 pointer-events-none">
      <div ref={menuShellRef} className="relative w-full max-w-5xl pointer-events-none">
        <div
          className="pointer-events-auto relative flex h-12 w-full items-center justify-between rounded-xl border border-white/10 bg-black/55 px-3 shadow-2xl backdrop-blur-2xl md:h-14 md:px-6"
        >
          <div className="flex items-center gap-4 md:gap-10">
            <Link href="/" prefetch className="flex items-center gap-2 group" onClick={() => handleNavClick("/")}>
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
                  prefetch
                  onClick={() => handleNavClick(link.activePath)}
                  className={cn(
                    "text-[10px] font-black uppercase tracking-[0.3em] transition-all duration-300 hover:text-foreground relative group/link",
                    activePath === link.activePath ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300",
                    activePath === link.activePath ? "w-full" : "w-0 group-hover/link:w-full"
                  )} />
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <Hamburger isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
            </div>
            <div className="hidden md:block">
              <UserMenu />
            </div>
          </div>
        </div>

        {/* Premium Dropdown */}
        <div
          className={cn(
            "pointer-events-auto absolute left-0 right-0 top-[calc(100%+0.5rem)] overflow-hidden rounded-xl border border-white/10 bg-black/55 p-1.5 shadow-2xl backdrop-blur-2xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
            mobileMenuOpen 
              ? "scale-100 opacity-100 translate-y-0" 
              : "pointer-events-none scale-[0.97] opacity-0 -translate-y-2"
          )}
        >
          <div className="flex flex-col gap-1">
            {links.map((link, i) => (
              <Link
                key={link.label}
                href={link.href}
                prefetch
                onClick={() => handleNavClick(link.activePath)}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-4 py-3 transition-all duration-300",
                  activePath === link.activePath ? "bg-white/10" : "hover:bg-white/5",
                  mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
                )}
                style={{ transitionDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-1 w-1 rounded-full transition-all duration-300",
                    activePath === link.activePath ? "bg-foreground scale-125" : "bg-white/20 group-hover:bg-white/40"
                  )} />
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-[0.2em]",
                    activePath === link.activePath ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {link.label}
                  </span>
                </div>
                <ArrowRight className={cn(
                    "h-3.5 w-3.5 transition-all duration-500",
                    activePath === link.activePath ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                  )} 
                />
              </Link>
            ))}
            
            <div className="my-1.5 h-px bg-white/5 mx-2" />
            
            <button
              onClick={() => {
                authClient.signOut({
                  fetchOptions: {
                    onSuccess: () => {
                      router.push("/login");
                    },
                  },
                });
              }}
              className={cn(
                "group flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all duration-300 hover:bg-destructive/10",
                mobileMenuOpen ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
              )}
              style={{ transitionDelay: `${links.length * 50}ms` }}
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-black uppercase tracking-[0.15em] text-foreground truncate">
                  {user.name}
                </span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50 truncate">
                  Sign Out
                </span>
              </div>
              <LogOut className="h-3.5 w-3.5 text-foreground/70 group-hover:text-foreground" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
