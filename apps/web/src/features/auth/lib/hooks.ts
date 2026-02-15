import { authClient } from "@/lib/auth-client";
import { useCallback } from "react";
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
