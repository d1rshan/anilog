"use client";

import { useState } from "react";
import { Twitter, Github, Instagram, MessageCircle, Globe, MapPin, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  displayName: z.string().min(2, "Display name must be at least 2 characters").max(50, "Display name must be at most 50 characters"),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional().nullable(),
  location: z.string().max(100, "Location must be at most 100 characters").optional().nullable(),
  website: z.union([z.string().url("Please enter a valid URL"), z.literal("")]).optional().nullable(),
  twitterUrl: z.union([z.string().url("Please enter a valid URL"), z.literal("")]).optional().nullable(),
  discordUrl: z.union([z.string().url("Please enter a valid URL"), z.literal("")]).optional().nullable(),
  githubUrl: z.union([z.string().url("Please enter a valid URL"), z.literal("")]).optional().nullable(),
  instagramUrl: z.union([z.string().url("Please enter a valid URL"), z.literal("")]).optional().nullable(),
  isPublic: z.boolean(),
});

type FormData = z.infer<typeof profileSchema>;

const socialPlatforms = [
  { key: "twitterUrl", icon: Twitter, label: "Twitter/X", color: "bg-sky-500/10 text-sky-500 hover:bg-sky-500/20", placeholder: "https://twitter.com/username" },
  { key: "discordUrl", icon: MessageCircle, label: "Discord", color: "bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20", placeholder: "https://discord.gg/invite" },
  { key: "githubUrl", icon: Github, label: "GitHub", color: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20", placeholder: "https://github.com/username" },
  { key: "instagramUrl", icon: Instagram, label: "Instagram", color: "bg-pink-500/10 text-pink-500 hover:bg-pink-500/20", placeholder: "https://instagram.com/username" },
] as const;

export function EditProfileDialog({ user, isOpen, onOpenChange, onSuccess }: EditProfileDialogProps) {
  const updateProfile = useUpdateMyProfile();
  const [activeSocialInput, setActiveSocialInput] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-none p-0 overflow-hidden shadow-2xl">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight">Edit Profile</DialogTitle>
          <DialogDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Customize your identity on Anilog
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-8 p-8 max-h-[70vh] overflow-y-auto">
          <div className="grid gap-6">
            {/* Display Name */}
            <div className="grid gap-2">
              <Label htmlFor="displayName" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Display Name
              </Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) => handleInputChange("displayName", e.target.value)}
                placeholder="Your name"
                className="h-12 border-none bg-muted px-4 font-bold focus-visible:ring-1 focus-visible:ring-foreground"
              />
              {errors.displayName && (
                <p className="text-[10px] font-bold uppercase text-destructive">{errors.displayName}</p>
              )}
            </div>

            {/* Bio */}
            <div className="grid gap-2">
              <Label htmlFor="bio" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                placeholder="Tell us about yourself..."
                className="min-h-[120px] border-none bg-muted px-4 py-3 font-medium focus-visible:ring-1 focus-visible:ring-foreground"
              />
              <div className="flex justify-between items-center">
                <p className="text-[10px] font-bold uppercase text-destructive">{errors.bio}</p>
                <p className={cn("text-[10px] font-black uppercase tracking-widest", bioCharCount > 500 ? "text-destructive" : "text-muted-foreground")}>
                  {bioCharCount}/500
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <div className="grid gap-2">
                <Label htmlFor="location" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="City, Country"
                  className="h-12 border-none bg-muted px-4 font-bold focus-visible:ring-1 focus-visible:ring-foreground"
                />
              </div>

              {/* Website */}
              <div className="grid gap-2">
                <Label htmlFor="website" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="h-12 border-none bg-muted px-4 font-bold focus-visible:ring-1 focus-visible:ring-foreground"
                />
              </div>
            </div>
          </div>

          {/* Social Links Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Social Links</h3>
            <div className="flex flex-wrap gap-4">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                const hasValue = !!(formData[platform.key as keyof FormData] as string);
                const isActive = activeSocialInput === platform.key;

                return (
                  <button
                    key={platform.key}
                    type="button"
                    onClick={() => toggleSocialInput(platform.key)}
                    className={cn(
                      "flex h-12 items-center gap-3 rounded-md px-4 transition-all border",
                      hasValue || isActive ? "border-foreground bg-muted shadow-sm" : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {platform.label.split('/')[0]}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeSocialInput && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {socialPlatforms.map((p) => p.key === activeSocialInput && (
                  <div key={p.key} className="grid gap-2">
                    <Input
                      id={p.key}
                      type="url"
                      value={(formData[p.key as keyof FormData] as string) || ""}
                      onChange={(e) => handleInputChange(p.key as keyof FormData, e.target.value)}
                      placeholder={p.placeholder}
                      className="h-12 border-none bg-muted px-4 font-bold focus-visible:ring-1 focus-visible:ring-foreground"
                      autoFocus
                    />
                    {errors[p.key] && (
                      <p className="text-[10px] font-bold uppercase text-destructive">{errors[p.key]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visibility Switch */}
          <div className="flex items-center justify-between rounded-md bg-muted p-6">
            <div className="space-y-1">
              <Label htmlFor="isPublic" className="text-xs font-black uppercase tracking-widest">
                Public Profile
              </Label>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Visible to everyone in the community
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
            />
          </div>
        </div>

        <DialogFooter className="bg-muted/50 p-8 pt-6">
          <Button variant="ghost" onClick={handleCancel} className="text-xs font-black uppercase tracking-widest">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateProfile.isPending} className="h-12 px-8 text-xs font-black uppercase tracking-widest">
            {updateProfile.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
