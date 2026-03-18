import { toast } from "sonner";
import { getApiErrorMessage } from "./eden-fetch";

type BaseToastContext = Record<string, unknown>;

type LibraryLogToastContext = {
  animeTitle?: string;
  status?: string;
  wasNewEntry?: boolean;
};

type LibraryEntryToastContext = {
  animeTitle?: string;
};

type ToastContextByKey = {
  "anime.upsert": BaseToastContext;
  "library.log": LibraryLogToastContext;
  "library.status.update": LibraryEntryToastContext;
  "library.progress.update": LibraryEntryToastContext;
  "library.rating.update": LibraryEntryToastContext;
  "library.remove": LibraryEntryToastContext;
  "user.follow": BaseToastContext;
  "user.unfollow": BaseToastContext;
  "user.profile.update": BaseToastContext;
  "admin.status.update": BaseToastContext;
  "admin.hero-curation.update": BaseToastContext;
};

type ToastMessageTemplate<TContext> = string | ((context: TContext) => string);

export const TOAST_MESSAGES = {
  // anime
  "anime.upsert": {
    success: "Anime added successfully",
    error: "Failed to add anime",
  },

  // library
  "library.log": {
    success: (context: LibraryLogToastContext) =>
      context.status === "watchlist" && context.wasNewEntry
        ? `Added ${context.animeTitle ?? "anime"} to watchlist.`
        : `Saved changes for ${context.animeTitle ?? "anime"}.`,
    error: "Failed to log anime",
  },
  "library.status.update": {
    success: (context: LibraryEntryToastContext) =>
      `Saved changes for ${context.animeTitle ?? "anime"}.`,
    error: "Failed to update status",
  },
  "library.progress.update": {
    success: (context: LibraryEntryToastContext) =>
      `Saved changes for ${context.animeTitle ?? "anime"}.`,
    error: "Failed to update progress",
  },
  "library.rating.update": {
    success: (context: LibraryEntryToastContext) =>
      `Saved changes for ${context.animeTitle ?? "anime"}.`,
    error: "Failed to update rating",
  },
  "library.remove": {
    success: (context: LibraryEntryToastContext) =>
      context.animeTitle
        ? `Removed ${context.animeTitle} from your library.`
        : "Removed anime from your library.",
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

function resolveToastMessage<TContext>(
  template: ToastMessageTemplate<TContext>,
  context?: TContext,
): string {
  if (typeof template === "function") {
    return template((context ?? {}) as TContext);
  }

  return template;
}

export function showSuccessToast<TKey extends ToastKey>(
  key: TKey,
  context?: ToastContextByKey[TKey],
): void;
export function showSuccessToast(key: ToastKey, context?: Record<string, unknown>): void;
export function showSuccessToast(key: ToastKey, context?: Record<string, unknown>) {
  toast.success(resolveToastMessage(TOAST_MESSAGES[key].success, context));
}

export function showErrorToast<TKey extends ToastKey>(
  key: TKey,
  error?: unknown,
  context?: ToastContextByKey[TKey],
): void;
export function showErrorToast(
  key: ToastKey,
  error?: unknown,
  context?: Record<string, unknown>,
): void;
export function showErrorToast(key: ToastKey, error?: unknown, context?: Record<string, unknown>) {
  let message: string = TOAST_MESSAGES[key].error;

  if (error) {
    message = getApiErrorMessage(error);
  } else {
    message = resolveToastMessage(
      TOAST_MESSAGES[key].error as ToastMessageTemplate<Record<string, unknown>>,
      context,
    );
  }

  toast.error(message);
}
