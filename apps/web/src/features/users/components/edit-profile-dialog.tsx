"use client";

import { useEffect, useState } from "react";
import { animate, motion, useMotionValue } from "framer-motion";
import { Twitter, Github, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CustomDialog,
  CustomDialogContent,
  CustomDialogDescription,
  CustomDialogFooter,
  CustomDialogHeader,
  CustomDialogTitle,
} from "@/components/custom-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useUpdateMyProfile } from "@/features/users/lib/hooks";
import type { UserWithProfile } from "@/features/users/lib/requests";
import { z } from "zod";
import { cn } from "@/lib/utils";

interface EditProfileDialogProps {
  user: UserWithProfile;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .max(50, "Display name must be at most 50 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional().nullable(),
  location: z.string().max(100, "Location must be at most 100 characters").optional().nullable(),
  website: z
    .union([z.string().url("Please enter a valid URL"), z.literal("")])
    .optional()
    .nullable(),
  twitterUrl: z
    .union([z.string().url("Please enter a valid URL"), z.literal("")])
    .optional()
    .nullable(),
  discordUrl: z
    .union([z.string().url("Please enter a valid URL"), z.literal("")])
    .optional()
    .nullable(),
  githubUrl: z
    .union([z.string().url("Please enter a valid URL"), z.literal("")])
    .optional()
    .nullable(),
  instagramUrl: z
    .union([z.string().url("Please enter a valid URL"), z.literal("")])
    .optional()
    .nullable(),
  isPublic: z.boolean(),
});

type FormData = z.infer<typeof profileSchema>;

const socialPlatforms = [
  {
    key: "twitterUrl",
    icon: Twitter,
    label: "Twitter/X",
    placeholder: "https://twitter.com/username",
  },
  {
    key: "discordUrl",
    icon: MessageCircle,
    label: "Discord",
    placeholder: "https://discord.gg/invite",
  },
  { key: "githubUrl", icon: Github, label: "GitHub", placeholder: "https://github.com/username" },
  {
    key: "instagramUrl",
    icon: Instagram,
    label: "Instagram",
    placeholder: "https://instagram.com/username",
  },
] as const;

export function EditProfileDialog({
  user,
  isOpen,
  onOpenChange,
  onSuccess,
}: EditProfileDialogProps) {
  const updateProfile = useUpdateMyProfile();
  const [activeSocialInput, setActiveSocialInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isMobileSheet, setIsMobileSheet] = useState(false);
  const dragY = useMotionValue(0);

  const [formData, setFormData] = useState<FormData>({
    displayName: user.profile?.displayName || user.name || "",
    bio: user.profile?.bio || "",
    location: user.profile?.location || "",
    website: user.profile?.website || "",
    twitterUrl: user.profile?.twitterUrl || "",
    discordUrl: user.profile?.discordUrl || "",
    githubUrl: user.profile?.githubUrl || "",
    instagramUrl: user.profile?.instagramUrl || "",
    isPublic: user.profile?.isPublic ?? true,
  });

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = String(issue.path[0]);
        newErrors[field] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const dataToSubmit = {
      displayName: formData.displayName || null,
      bio: formData.bio || null,
      location: formData.location || null,
      website: formData.website || null,
      twitterUrl: formData.twitterUrl || null,
      discordUrl: formData.discordUrl || null,
      githubUrl: formData.githubUrl || null,
      instagramUrl: formData.instagramUrl || null,
      isPublic: formData.isPublic,
    };

    updateProfile.mutate(dataToSubmit, {
      onSuccess: () => {
        onOpenChange(false);
        onSuccess?.();
      },
    });
  };

  const handleCancel = () => {
    setFormData({
      displayName: user.profile?.displayName || user.name || "",
      bio: user.profile?.bio || "",
      location: user.profile?.location || "",
      website: user.profile?.website || "",
      twitterUrl: user.profile?.twitterUrl || "",
      discordUrl: user.profile?.discordUrl || "",
      githubUrl: user.profile?.githubUrl || "",
      instagramUrl: user.profile?.instagramUrl || "",
      isPublic: user.profile?.isPublic ?? true,
    });
    setErrors({});
    setActiveSocialInput(null);
    onOpenChange(false);
  };

  const toggleSocialInput = (platformKey: string) => {
    setActiveSocialInput((current) => (current === platformKey ? null : platformKey));
  };

  const bioCharCount = formData.bio?.length || 0;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 639px)");
    const apply = () => setIsMobileSheet(media.matches);
    apply();

    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (isOpen) {
      dragY.set(0);
    }
  }, [dragY, isOpen]);

  const dismissWithDragAnimation = () => {
    const target = typeof window !== "undefined" ? window.innerHeight * 0.5 : 420;

    animate(dragY, target, {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
      onComplete: () => onOpenChange(false),
    });
  };

  return (
    <CustomDialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent
        showCloseButton={false}
        className={cn(
          "fixed inset-x-0 bottom-0 top-auto left-0 z-50 w-full max-w-none translate-x-0 translate-y-0 border-0 bg-transparent p-0 shadow-none outline-none",
          "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-bottom-4 duration-150",
          "sm:left-[50%] sm:top-[50%] sm:bottom-auto sm:w-full sm:max-w-4xl sm:-translate-x-1/2 sm:-translate-y-1/2",
        )}
      >
        <motion.div
          style={{ y: dragY }}
          drag={isMobileSheet ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.22 }}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            if (!isMobileSheet) {
              return;
            }

            if (info.offset.y > 140 || info.velocity.y > 900) {
              dismissWithDragAnimation();
              return;
            }

            animate(dragY, 0, { type: "spring", stiffness: 480, damping: 38, mass: 0.72 });
          }}
          className={cn(
            "flex max-h-[92svh] w-full transform-gpu flex-col overflow-hidden rounded-t-[1.4rem] rounded-b-none border border-white/10 bg-black text-white shadow-2xl will-change-transform",
            "sm:max-h-[88svh] sm:rounded-2xl",
          )}
        >
          <CustomDialogHeader className="space-y-2 border-b border-white/10 px-5 pb-4 pt-3 text-left sm:px-8 sm:pb-6 sm:pt-6">
            <div className="mx-auto mb-1 h-1.5 w-14 rounded-full bg-white/20 sm:hidden" />
            <p className="text-[10px] font-black uppercase tracking-[0.32em] text-white/40">
              Archive Console
            </p>
            <CustomDialogTitle className="text-3xl font-black uppercase leading-[0.9] tracking-tight text-white sm:text-4xl">
              Edit Profile
            </CustomDialogTitle>
            <CustomDialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">
              Customize your identity on Anilog
            </CustomDialogDescription>
          </CustomDialogHeader>

          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-5 sm:px-8 sm:pb-8 sm:pt-6">
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-5">
              <section className="rounded-2xl border border-white/10 bg-black p-5 sm:p-6 lg:col-span-5">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
                  Identity
                </p>
                <div className="mt-4 grid gap-5">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="displayName"
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange("displayName", e.target.value)}
                      placeholder="Your name"
                      className="h-12 border border-white/10 bg-black px-4 font-bold text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30"
                    />
                    {errors.displayName && (
                      <p className="text-[10px] font-bold uppercase text-destructive">
                        {errors.displayName}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="bio"
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45"
                    >
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={formData.bio || ""}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself..."
                      className="min-h-[150px] border border-white/10 bg-black px-4 py-3 font-medium text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30"
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-bold uppercase text-destructive">
                        {errors.bio}
                      </p>
                      <p
                        className={cn(
                          "text-[10px] font-black uppercase tracking-widest",
                          bioCharCount > 500 ? "text-destructive" : "text-white/45",
                        )}
                      >
                        {bioCharCount}/500
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black p-5 sm:p-6 lg:col-span-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
                  Links
                </p>
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <div className="grid gap-2">
                    <Label
                      htmlFor="location"
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45"
                    >
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      placeholder="City, Country"
                      className="h-12 border border-white/10 bg-black px-4 font-bold text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      htmlFor="website"
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45"
                    >
                      Website
                    </Label>
                    <Input
                      id="website"
                      type="url"
                      value={formData.website || ""}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="h-12 border border-white/10 bg-black px-4 font-bold text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30"
                    />
                    {errors.website && (
                      <p className="text-[10px] font-bold uppercase text-destructive">
                        {errors.website}
                      </p>
                    )}
                  </div>

                  <div className="mt-1 flex items-center justify-between rounded-xl border border-white/10 bg-black px-4 py-3">
                    <div className="space-y-1">
                      <Label
                        htmlFor="isPublic"
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-white"
                      >
                        Public Profile
                      </Label>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/45">
                        Visible to everyone
                      </p>
                    </div>
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
                    />
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-white/10 bg-black p-5 sm:p-6 lg:col-span-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/45">
                  Social Links
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {socialPlatforms.map((platform) => {
                    const Icon = platform.icon;
                    const hasValue = !!(formData[platform.key as keyof FormData] as string);
                    const isActive = activeSocialInput === platform.key;

                    return (
                      <button
                        key={platform.key}
                        type="button"
                        onClick={() => toggleSocialInput(platform.key)}
                        aria-label={platform.label}
                        title={platform.label}
                        className={cn(
                          "flex h-11 w-11 items-center justify-center rounded-full border transition-all",
                          hasValue || isActive
                            ? "border-white/35 bg-white text-black"
                            : "border-white/10 bg-black text-white/80 hover:border-white/20 hover:bg-black",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>

                {activeSocialInput && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {socialPlatforms.map(
                      (p) =>
                        p.key === activeSocialInput && (
                          <div key={p.key} className="grid gap-2">
                            <Input
                              id={p.key}
                              type="url"
                              value={(formData[p.key as keyof FormData] as string) || ""}
                              onChange={(e) =>
                                handleInputChange(p.key as keyof FormData, e.target.value)
                              }
                              placeholder={p.placeholder}
                              className="h-12 border border-white/10 bg-black px-4 font-bold text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-white/30"
                              autoFocus
                            />
                            {errors[p.key] && (
                              <p className="text-[10px] font-bold uppercase text-destructive">
                                {errors[p.key]}
                              </p>
                            )}
                          </div>
                        ),
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>

          <CustomDialogFooter className="border-t border-white/10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pb-8 sm:pt-6">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-xs font-black uppercase tracking-widest text-white/70 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateProfile.isPending}
              className="h-12 rounded-full border border-white/20 bg-white px-8 text-xs font-black uppercase tracking-[0.24em] text-black hover:bg-white"
            >
              {updateProfile.isPending ? "Saving..." : "Save Profile"}
            </Button>
          </CustomDialogFooter>
        </motion.div>
      </CustomDialogContent>
    </CustomDialog>
  );
}
