"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="bottom-center"
      expand
      richColors
      closeButton={false}
      visibleToasts={5}
      className="anilog-toaster group"
      toastOptions={{
        duration: 3000,
        classNames: {
          toast:
            "anilog-toast group rounded-xl border border-white/10 bg-black/55 px-4 py-3 shadow-2xl backdrop-blur-2xl",
          title:
            "font-display text-[0.74rem] font-black uppercase tracking-[0.22em] text-white",
          description:
            "mt-1 text-[0.64rem] font-bold uppercase tracking-[0.16em] text-white/65",
          icon: "mr-1.5 text-white/90",
          actionButton:
            "rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-black",
          cancelButton:
            "rounded-full border border-white/15 bg-transparent px-3 py-1.5 text-[0.6rem] font-black uppercase tracking-[0.2em] text-white/70 transition hover:border-white/35 hover:text-white",
          success: "anilog-toast-success",
          error: "anilog-toast-error",
          info: "anilog-toast-info",
          warning: "anilog-toast-warning",
        },
      }}
      style={
        {
          "--normal-bg": "rgba(0, 0, 0, 0.55)",
          "--normal-text": "rgba(255, 255, 255, 0.98)",
          "--normal-border": "rgba(255, 255, 255, 0.1)",
          "--success-bg": "rgba(0, 0, 0, 0.55)",
          "--success-text": "rgba(255, 255, 255, 0.98)",
          "--success-border": "rgba(255, 255, 255, 0.1)",
          "--error-bg": "rgba(0, 0, 0, 0.55)",
          "--error-text": "rgba(255, 255, 255, 0.98)",
          "--error-border": "rgba(255, 255, 255, 0.1)",
          "--warning-bg": "rgba(0, 0, 0, 0.55)",
          "--warning-text": "rgba(255, 255, 255, 0.98)",
          "--warning-border": "rgba(255, 255, 255, 0.1)",
          "--info-bg": "rgba(0, 0, 0, 0.55)",
          "--info-text": "rgba(255, 255, 255, 0.98)",
          "--info-border": "rgba(255, 255, 255, 0.1)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
