import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useSession = () => authClient.useSession();

export function useAuth() {
  const sessionQuery = useSession();
  const session = sessionQuery.data ?? null;
  const user = session?.user ?? null;

  return {
    ...sessionQuery,
    session,
    user,
    userId: user?.id ?? null,
    username: user?.username ?? user?.name ?? null,
    isAuthenticated: Boolean(user),
  };
}

interface UseRequireAuthOptions {
  toastMessage?: string;
  onUnauthenticated?: () => void;
}

export function useRequireAuth(options: UseRequireAuthOptions = {}) {
  const {
    toastMessage = "Please sign in to continue",
    onUnauthenticated,
  } = options;
  const auth = useAuth();

  const requireAuth = useCallback(() => {
    if (auth.isAuthenticated) {
      return true;
    }

    if (toastMessage) {
      toast.error(toastMessage);
    }
    onUnauthenticated?.();
    return false;
  }, [auth.isAuthenticated, onUnauthenticated, toastMessage]);

  return {
    ...auth,
    requireAuth,
  };
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut();
      if (result.error) {
        throw new Error(result.error.message || "Failed to sign out");
      }
    },
    onSuccess: () => {
      queryClient.clear();
      router.replace("/");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to sign out");
    },
  });
}
