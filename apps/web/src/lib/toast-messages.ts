import { toast } from "sonner";
import { ApiError } from "./eden-fetch";

export const TOAST_MESSAGES = {
  // anime
  "anime.upsert": {
    success: "Anime added successfully",
    error: "Failed to add anime",
  },

  // library
  "library.log": {
    success: "Added to library",
    error: "Failed to log anime",
  },
  "library.status.update": {
    success: "Status updated",
    error: "Failed to update status",
  },
  "library.progress.update": {
    success: "Progress updated",
    error: "Failed to update progress",
  },
  "library.rating.update": {
    success: "Rating updated",
    error: "Failed to update rating",
  },
  "library.remove": {
    success: "Removed from library",
    error: "Failed to remove anime",
  },

  // users
  "user.follow": {
    success: "Successfully followed user!",
    error: "Failed to follow user",
  },
  "user.unfollow": {
    success: "Successfully unfollowed user",
    error: "Failed to unfollow user",
  },
  "user.profile.update": {
    success: "Profile updated successfully!",
    error: "Failed to update profile",
  },

  // admin
  "admin.status.update": {
    success: "Admin status updated",
    error: "Failed to update admin status",
  },
  "admin.hero-curation.update": {
    success: "Hero curation updated",
    error: "Failed to update hero curation",
  },
} as const;

export type ToastKey = keyof typeof TOAST_MESSAGES;

export function showSuccessToast(key: ToastKey) {
  toast.success(TOAST_MESSAGES[key].success);
}

export function showErrorToast(key: ToastKey, error?: unknown) {
  let message: string = TOAST_MESSAGES[key].error;

  if (error instanceof ApiError && error.message) {
    message = error.message;
  }

  toast.error(message);
}
