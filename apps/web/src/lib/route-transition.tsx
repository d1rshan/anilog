"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import { ROUTE_TRANSITION, shouldAnimatePath } from "@/lib/page-transition";

type TransitionPhase = "idle" | "covering" | "waiting" | "revealing";

type RouteTransitionContextValue = {
  isNavigating: boolean;
  phase: TransitionPhase;
  pendingPath: string | null;
  startNavigation: (targetPath: string) => void;
};

const RouteTransitionContext = createContext<RouteTransitionContextValue | null>(null);

export function RouteTransitionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [phase, setPhase] = useState<TransitionPhase>("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const startNavigation = useCallback(
    (targetPath: string) => {
      if (targetPath === pathname) return;
      if (!shouldAnimatePath(targetPath)) return;

      setPendingPath(targetPath);
      setStartedAt(Date.now());
      setPhase("covering");
    },
    [pathname],
  );

  useEffect(() => {
    if (phase !== "covering") return;

    const coverTimer = window.setTimeout(() => {
      setPhase((current) => (current === "covering" ? "waiting" : current));
    }, ROUTE_TRANSITION.coverDurationMs);

    return () => window.clearTimeout(coverTimer);
  }, [phase]);

  useEffect(() => {
    if (!pendingPath) return;
    if (pathname !== pendingPath) return;
    if (phase === "revealing" || phase === "idle") return;

    const elapsed = startedAt ? Date.now() - startedAt : ROUTE_TRANSITION.coverDurationMs;
    const waitForCoverToFinish = Math.max(0, ROUTE_TRANSITION.coverDurationMs - elapsed);

    const readyTimer = window.setTimeout(() => {
      setPhase("revealing");
    }, waitForCoverToFinish + ROUTE_TRANSITION.holdDurationMs);

    return () => window.clearTimeout(readyTimer);
  }, [pathname, pendingPath, phase, startedAt]);

  useEffect(() => {
    if (phase !== "covering" && phase !== "waiting") return;

    const fallbackTimer = window.setTimeout(() => {
      setPhase("revealing");
    }, ROUTE_TRANSITION.maxPendingMs);

    return () => window.clearTimeout(fallbackTimer);
  }, [phase]);

  useEffect(() => {
    if (phase !== "revealing") return;

    const revealTimer = window.setTimeout(() => {
      setPhase("idle");
      setPendingPath(null);
      setStartedAt(null);
    }, ROUTE_TRANSITION.revealDurationMs);

    return () => window.clearTimeout(revealTimer);
  }, [phase]);

  const value = useMemo<RouteTransitionContextValue>(
    () => ({
      isNavigating: phase !== "idle",
      phase,
      pendingPath,
      startNavigation,
    }),
    [phase, pendingPath, startNavigation],
  );

  return <RouteTransitionContext.Provider value={value}>{children}</RouteTransitionContext.Provider>;
}

export function useRouteTransition() {
  const context = useContext(RouteTransitionContext);
  if (!context) {
    throw new Error("useRouteTransition must be used inside RouteTransitionProvider");
  }
  return context;
}
