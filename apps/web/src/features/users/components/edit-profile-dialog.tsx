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
    // Clear error when user starts typing
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

    // Convert empty strings to null
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
    // Reset form to initial values
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
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Display Name */}
          <div className="grid gap-2">
            <Label htmlFor="displayName" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Display Name
            </Label>
            <Input
              id="displayName"
              value={formData.displayName}
              onChange={(e) => handleInputChange("displayName", e.target.value)}
              placeholder="Your display name"
              className={errors.displayName ? "border-red-500" : ""}
            />
            {errors.displayName && (
              <p className="text-sm text-red-500">{errors.displayName}</p>
            )}
          </div>

          {/* Bio */}
          <div className="grid gap-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className={errors.bio ? "border-red-500" : ""}
            />
            <div className="flex justify-between items-center">
              {errors.bio ? (
                <p className="text-sm text-red-500">{errors.bio}</p>
              ) : (
                <span />
              )}
              <p className={`text-xs ${bioCharCount > 500 ? "text-red-500" : "text-muted-foreground"}`}>
                {bioCharCount}/500
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="grid gap-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <Input
              id="location"
              value={formData.location || ""}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="City, Country"
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Website */}
          <div className="grid gap-2">
            <Label htmlFor="website" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Website
            </Label>
            <Input
              id="website"
              type="url"
              value={formData.website || ""}
              onChange={(e) => handleInputChange("website", e.target.value)}
              placeholder="https://yourwebsite.com"
              className={errors.website ? "border-red-500" : ""}
            />
            {errors.website && (
              <p className="text-sm text-red-500">{errors.website}</p>
            )}
          </div>

          {/* Social Links */}
          <div className="grid gap-2">
            <Label>Social Links</Label>
            <div className="flex gap-3">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                const hasValue = !!(formData[platform.key as keyof FormData] as string);
                const isActive = activeSocialInput === platform.key;

                return (
                  <button
                    key={platform.key}
                    type="button"
                    onClick={() => toggleSocialInput(platform.key)}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all
                      ${platform.color}
                      ${hasValue ? "ring-2 ring-offset-2 ring-current" : ""}
                      ${isActive ? "scale-110" : ""}
                    `}
                    aria-label={platform.label}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>

            {/* Active Social Input */}
            {activeSocialInput && (
              <div className="mt-2">
                {socialPlatforms.map((platform) => {
                  if (platform.key !== activeSocialInput) return null;
                  const hasError = !!errors[platform.key];

                  return (
                    <div key={platform.key} className="grid gap-2">
                      <Label htmlFor={platform.key} className="text-sm font-medium">
                        {platform.label} URL
                      </Label>
                      <Input
                        id={platform.key}
                        type="url"
                        value={(formData[platform.key as keyof FormData] as string) || ""}
                        onChange={(e) => handleInputChange(platform.key as keyof FormData, e.target.value)}
                        placeholder={platform.placeholder}
                        className={hasError ? "border-red-500" : ""}
                        autoFocus
                      />
                      {hasError && (
                        <p className="text-sm text-red-500">{errors[platform.key]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Profile Visibility */}
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <Label htmlFor="isPublic" className="text-sm font-medium">
                  Public Profile
                </Label>
                <p className="text-xs text-muted-foreground">
                  Allow others to find and view your profile
                </p>
              </div>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange("isPublic", checked)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={updateProfile.isPending}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
