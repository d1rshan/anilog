"use client";

import { motion } from "framer-motion";
import { useRouteTransition } from "@/lib/route-transition";
import { cn } from "@/lib/utils";
import { PageTransitionOverlay } from "@/components/page-transition-overlay";

export function RouteTransitionShell({ children }: { children: React.ReactNode }) {
  const { isNavigating } = useRouteTransition();

  return (
    <>
      <PageTransitionOverlay />
      <motion.div
        animate={{
          opacity: isNavigating ? 0 : 1,
          filter: isNavigating ? "blur(20px)" : "blur(0px)",
          scale: isNavigating ? 0.98 : 1,
        }}
        transition={{
          duration: isNavigating ? 0.2 : 0.4,
          ease: [0.22, 1, 0.36, 1], // Quintic Out
        }}
        className={cn("relative w-full h-full", isNavigating && "anilog-route-transitioning")}
      >
        {children}
      </motion.div>
    </>
  );
}
