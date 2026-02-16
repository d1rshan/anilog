"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouteTransition } from "@/lib/route-transition";

export function PageTransitionOverlay() {
  const { phase } = useRouteTransition();
  const isActive = phase !== "idle";

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div 
          className="pointer-events-none fixed inset-0 z-40 bg-black/20 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        />
      )}
    </AnimatePresence>
  );
}
